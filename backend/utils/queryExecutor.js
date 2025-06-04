import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Supplier from '../models/Supplier.js';
import StockMovement from '../models/StockMovement.js';

/**
 * Utility to safely execute generated queries against MongoDB
 */
export default class QueryExecutor {
  /**
   * Execute a SQL-like query against MongoDB collections
   * @param {string} query - The SQL-like query to execute
   * @returns {Promise<Array>} - Query results
   */
  async executeQuery(query) {
    try {
      // Clean up the query
      if (typeof query === 'string') {
        query = query.trim();
      }
      
      //console.log('Query type:', typeof query);
      
      // Check if the query is a string or an object
      if (typeof query === 'object' || 
          (typeof query === 'string' && (query.startsWith('[') && query.endsWith(']')))) {
        // It's likely a MongoDB aggregation pipeline array
        console.log('Detected MongoDB array format');
        return await this.executeMongoArrayQuery(query);
      }
      
      // If it's a string, determine if it's MongoDB or SQL
      const queryLower = typeof query === 'string' ? query.toLowerCase() : '';
      
      // Handle MongoDB specific syntax in string format
      if (queryLower.includes('aggregate(') || queryLower.includes('find(') || 
          queryLower.includes('db.')) {
        console.log('Detected MongoDB string format');
        return await this.executeMongoQuery(query);
      } else {
        // Handle SQL-like syntax
        console.log('Detected SQL format');
        return await this.executeSqlLikeQuery(query);
      }
    } catch (error) {
      console.error('Error executing query:', error);
      throw new Error(`Failed to execute query: ${error.message}`);
    }
  }

  /**
   * Execute a MongoDB-specific query
   * @param {string} query - MongoDB query string
   * @returns {Promise<Array>} - Query results
   */
  /**
   * Execute a MongoDB query that's already in array format
   * @param {Array|string} query - MongoDB aggregation pipeline array or string representation
   * @returns {Promise<Array>} - Query results
   */
  async executeMongoArrayQuery(query) {
    try {      
      // If the query is a string representation of an array, parse it
      let pipeline;
      if (typeof query === 'string') {
        try {
          // Use Function constructor to safely evaluate the array
          const pipelineFunction = new Function(`return ${query}`);
          pipeline = pipelineFunction();
        } catch (parseError) {
          console.error('Error parsing pipeline array string:', parseError);
          throw new Error(`Invalid pipeline array format: ${parseError.message}`);
        }
      } else {
        // It's already an object/array
        pipeline = query;
      }
      
      // Determine the model to use from the pipeline
      // Default to Product for low stock queries
      const model = Product;
      
      console.log('Executing aggregation with pipeline:', JSON.stringify(pipeline, null, 2));
      return await model.aggregate(pipeline).exec();
    } catch (error) {
      console.error('MongoDB array query execution error:', error);
      throw new Error(`Failed to execute MongoDB array query: ${error.message}`);
    }
  }
  
  /**
   * Execute a MongoDB-specific query in string format
   * @param {string} query - MongoDB query string
   * @returns {Promise<Array>} - Query results
   */
  async executeMongoQuery(query) {
    try {
      // Clean up the query string
      query = query.trim();
      
      // Detect query type and collection
      let collection = 'products'; // Default to products
      const queryLower = query.toLowerCase();
      
      if (queryLower.includes('db.categories') || queryLower.includes('category')) {
        collection = 'categories';
      } else if (queryLower.includes('db.suppliers') || queryLower.includes('supplier')) {
        collection = 'suppliers';
      } else if (queryLower.includes('db.stockmovements') || queryLower.includes('stockmovement')) {
        collection = 'stockmovements';
      }
      
      const model = this.getModelForCollection(collection);
      
      // Handle MongoDB aggregation pipeline format
      if (queryLower.includes('aggregate')) {
        
        // Manually parse MongoDB aggregation pipeline for better control
        // and to avoid JSON parse issues
        try {
          // Extract model name and determine correct model collection
          let modelName = 'products'; // Default
          
          if (queryLower.includes('db.')) {
            // Extract model name from db.X.aggregate format
            const dbMatch = query.match(/db\.([^\s.]+)/i);
            if (dbMatch && dbMatch[1]) {
              modelName = dbMatch[1].toLowerCase();
            }
          }
          
          // Get the model based on the collection name (handles both 'product' and 'Product')
          const model = this.getModelForCollection(modelName);
          
          // Now extract and parse the aggregation pipeline
          // First, we identify the full pipeline string inside the square brackets
          let startIdx = query.indexOf('[');
          let endIdx = query.lastIndexOf(']');
          
          if (startIdx === -1 || endIdx === -1) {
            throw new Error('Could not locate aggregation pipeline brackets [] in query');
          }
          
          // Extract the pipeline string including the brackets
          const fullPipelineStr = query.substring(startIdx, endIdx + 1);
          
          // We'll use Function constructor for safer evaluation
          // This avoids eval() but still allows us to parse the MongoDB query syntax
          const pipelineFunction = new Function(`return ${fullPipelineStr}`);
          const pipeline = pipelineFunction();
          
          // Execute the aggregation with the parsed pipeline
          return await model.aggregate(pipeline).exec();
        } catch (error) {
          console.error('Error parsing or executing MongoDB aggregation:', error);
          throw new Error(`MongoDB aggregation error: ${error.message}`);
        }
      } 
      // Handle find queries
      else if (queryLower.includes('find(')) {
        
        try {
          // Extract model name and determine correct model collection
          let modelName = 'products'; // Default
          
          if (queryLower.includes('db.')) {
            // Extract model name from db.X.find format
            const dbMatch = query.match(/db\.([^\s.]+)/i);
            if (dbMatch && dbMatch[1]) {
              modelName = dbMatch[1].toLowerCase();
            }
          }
          
          // Get the model based on the collection name
          const model = this.getModelForCollection(modelName);
          
          // Extract the filter object within parentheses
          let startIdx = query.indexOf('(');
          let endIdx = query.lastIndexOf(')');
          
          if (startIdx === -1 || endIdx === -1) {
            throw new Error('Could not locate find filter parentheses () in query');
          }
          
          // Extract the filter string
          const filterStr = query.substring(startIdx + 1, endIdx).trim();
          
          // Parse the filter - handling empty filter case
          let filter = {};
          if (filterStr && filterStr !== '') {
            const filterFunction = new Function(`return ${filterStr}`);
            filter = filterFunction();
          }
            
          // Execute find
          return await model.find(filter).lean().exec();
        } catch (error) {
          console.error('Error parsing or executing MongoDB find:', error);
          throw new Error(`MongoDB find error: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('MongoDB query execution error:', error);
      throw new Error(`Failed to execute MongoDB query: ${error.message}`);
    }
  }

  /**
   * Execute a SQL-like query by translating to MongoDB operations
   * @param {string} query - SQL query string
   * @returns {Promise<Array>} - Query results
   */
  async executeSqlLikeQuery(query) {
    const sqlLower = query.toLowerCase().trim();
    
    // Simplified SQL parser - in production use a proper SQL parser library
    if (sqlLower.startsWith('select')) {
      // Extract table/collection name
      let collectionMatch = sqlLower.match(/from\s+(\w+)/i);
      if (!collectionMatch) {
        throw new Error('Unable to determine collection from SQL query');
      }
      
      const collection = collectionMatch[1].toLowerCase();
      const model = this.getModelForCollection(collection);
      
      // Extract conditions if any
      let conditions = {};
      const whereMatch = sqlLower.match(/where\s+(.*?)(?:group by|order by|limit|$)/i);
      if (whereMatch) {
        // Very simplified condition parsing - would need proper SQL parsing in production
        const whereCondition = whereMatch[1].trim();
        
        // Handle common conditions
        if (whereCondition.includes('current_quantity < minimum_stock_level') || 
            whereCondition.includes('is_low_stock')) {
          // Low stock query
          return await Product.find({ $expr: { $lt: ['$currentQuantity', '$minimumStockLevel'] } }).lean();
        } else if (whereCondition.includes('=')) {
          // Simple equality
          const parts = whereCondition.split('=').map(p => p.trim());
          const field = this.transformFieldName(parts[0]);
          let value = parts[1].replace(/'/g, '').replace(/"/g, '');
          
          // Try to parse numbers
          if (!isNaN(value)) {
            value = Number(value);
          }
          
          conditions[field] = value;
        }
      }
      
      // Handle fields to select
      let projection = {};
      const selectMatch = sqlLower.match(/select\s+(.*?)\s+from/i);
      if (selectMatch && selectMatch[1] !== '*') {
        const fields = selectMatch[1].split(',').map(f => f.trim());
        fields.forEach(field => {
          projection[this.transformFieldName(field)] = 1;
        });
      }
      
      // Handle joins (basic support)
      if (sqlLower.includes('join')) {
        // This would require more complex logic with proper aggregation pipelines
        // For now, we'll use a basic approach for common joins
        
        if (sqlLower.includes('product') && sqlLower.includes('category')) {
          return await Product.find(conditions)
            .populate('category')
            .lean();
        } else if (sqlLower.includes('product') && sqlLower.includes('supplier')) {
          return await Product.find(conditions)
            .populate('supplier')
            .lean();
        } else if (sqlLower.includes('stockmovement') && sqlLower.includes('product')) {
          return await StockMovement.find(conditions)
            .populate('product')
            .lean();
        }
      }
      
      // Default query execution
      const query = Object.keys(projection).length > 0 
        ? model.find(conditions).select(projection)
        : model.find(conditions);
        
      return await query.lean().exec();
    } else {
      throw new Error('Only SELECT queries are supported');
    }
  }
  
  /**
   * Get the appropriate mongoose model for a collection name
   * @param {string} collection - Collection name
   * @returns {mongoose.Model} - Mongoose model
   */
  getModelForCollection(collection) {
    collection = collection.toLowerCase();
    
    if (collection === 'products' || collection === 'product') {
      return Product;
    } else if (collection === 'categories' || collection === 'category') {
      return Category;
    } else if (collection === 'suppliers' || collection === 'supplier') {
      return Supplier;
    } else if (collection === 'stockmovements' || collection === 'stockmovement') {
      return StockMovement;
    } else {
      throw new Error(`Unknown collection: ${collection}`);
    }
  }
  
  /**
   * Transform SQL-style field names to MongoDB field names
   * @param {string} field - SQL field name
   * @returns {string} - MongoDB field name
   */
  transformFieldName(field) {
    // Map common SQL field names to MongoDB field names
    const fieldMap = {
      'name': 'name',
      'description': 'description',
      'current_quantity': 'currentQuantity',
      'minimum_stock_level': 'minimumStockLevel',
      'price': 'price',
      'expiration_date': 'expirationDate',
      'is_low_stock': 'isLowStock',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
      'movement_type': 'movementType',
      'quantity': 'quantity',
      'reason': 'reason',
      'movement_date': 'movementDate'
    };
    
    const normalizedField = field.toLowerCase().trim();
    return fieldMap[normalizedField] || normalizedField;
  }
} 
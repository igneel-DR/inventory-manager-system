import OpenAI from 'openai';

/**
 * Service for handling AI-powered natural language processing via AI API
 */
export default class AiService {
  constructor() {
    this.apiKey = process.env.AI_API_KEY;
    this.apiEndpoint = process.env.AI_API_ENDPOINT || 'https://api.deepseek.com';
    this.model = process.env.AI_MODEL || 'deepseek-coder';
    
    // Initialize OpenAI client with AI endpoint
    this.client = new OpenAI({
      baseURL: this.apiEndpoint,
      apiKey: this.apiKey,
      // Only set this to true for frontend usage
      dangerouslyAllowBrowser: false,
    });
    
    // Database schema reference for the AI prompt
    this.dbSchema = `
      Products Schema:
      - _id: ObjectId
      - name: String (product name)
      - description: String (product description)
      - category: ObjectId (references Category)
      - supplier: ObjectId (references Supplier)
      - currentQuantity: Number (current stock quantity)
      - minimumStockLevel: Number (reorder point)
      - price: Number (product price)
      - expirationDate: Date (product expiration date, if applicable)
      - createdAt: Date (when the product was added)
      - updatedAt: Date (when the product was last updated)
      
      Categories Schema:
      - _id: ObjectId
      - name: String (category name)
      - description: String (category description)
      - isActive: Boolean (whether category is active)
      
      Suppliers Schema:
      - _id: ObjectId
      - name: String (supplier name)
      - email: String (supplier email)
      - phone: String (supplier phone)
      - company: String (supplier company name)
      - city: String (supplier location)
      
      StockMovements Schema:
      - _id: ObjectId
      - product: ObjectId (references Product)
      - movementType: String (enum: 'in', 'out')
      - quantity: Number (quantity moved)
      - reason: String (reason for movement)
      - movementDate: Date (when movement occurred)
      - createdAt: Date (record creation timestamp)
    `;
  }

  /**
   * Convert natural language query to SQL query
   * @param {string} userQuery - User's natural language query
   * @returns {Promise<string>} - Generated SQL query
   */
  async convertToSQL(userQuery) {
    try {
      const prompt = `
        You are a database expert translating natural language questions about inventory into SQL queries.
        
        DATABASE SCHEMA:
        ${this.dbSchema}
        
        TASK:
        - Analyze the user's question and generate the appropriate SQL query based on the schema.
        - Return ONLY the SQL query without any explanations or comments.
        - The SQL must be compatible with MongoDB's aggregation pipeline syntax.
        - Support multilingual queries (Arabic, French, English, etc.).
        - For low stock questions, refer to items where currentQuantity == 0, which means the item is out of stock or considered low stock.
        - For time-based queries, use the appropriate date operations.
        - NEVER ask for clarification - make reasonable assumptions if needed.
        - Use proper variable naming and avoid SQL injection risks.
        - You must ONLY generate read-only operations (SELECT queries).
        - NEVER generate INSERT, UPDATE, DELETE, or other write operations.
        - Your query MUST start with 'SELECT' or use 'FIND()' or 'AGGREGATE()' functions.
        - IMPORTANT FOR JOINS: Always use lowercase collection names ('products', 'suppliers', 'categories', 'stockmovements').
        - For supplier lookups, use case-insensitive regex match when possible: { $regex: 'supplier name', $options: 'i' }
        - DO NOT include anything other than the SQL query in your response.
        
        USER QUESTION: "${userQuery}"
        
        SQL QUERY:
      `;

      // Create completion with retry logic
      let retries = 0;
      const maxRetries = 3;
      let error;
      
      while (retries < maxRetries) {
        try {
          const completion = await this.client.chat.completions.create({
            model: this.model,
            messages: [
              { 
                role: 'system', 
                content: 'You are a database expert that converts natural language to SQL queries. Respond only with valid SQL.' 
              },
              { 
                role: 'user', 
                content: prompt 
              }
            ],
            temperature: 0.1,
            max_tokens: 1500
          });
          
          // Extract and validate the SQL query
          const sqlQuery = completion.choices[0].message.content.trim();
          return this.sanitizeQuery(sqlQuery);
        } catch (err) {
          error = err;
          retries++;
          if (retries < maxRetries) {
            // Wait with exponential backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          }
        }
      }
      
      // If we get here, all retries failed
      console.error('Error converting to SQL after retries:', error);
      throw new Error('Failed to process natural language query');
    } catch (error) {
      console.error('Error converting to SQL:', error);
      throw new Error('Failed to process natural language query');
    }
  }

  /**
   * Sanitize and validate the SQL query for security
   * @param {string} query - The SQL query to sanitize
   * @returns {string} - Sanitized SQL query
   */
  sanitizeQuery(query) {
    if (!query || typeof query !== 'string') {
      throw new Error('Invalid query format');
    }
    
    // Clean the query - remove SQL code blocks if present
    let cleanedQuery = query.trim();
    if (cleanedQuery.startsWith('```') && cleanedQuery.endsWith('```')) {
      // Remove markdown code blocks
      cleanedQuery = cleanedQuery.replace(/^```[\w]*\n|```$/g, '');
    }
    
    // Remove any potentially dangerous commands
    const dangerousCommands = [
      'DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'UPDATE', 'INSERT',
      'CREATE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE'
    ];

    // Basic validation to ensure we're only allowing read operations
    const queryUpperCase = cleanedQuery.toUpperCase().trim();
    
    for (const cmd of dangerousCommands) {
      if (queryUpperCase.includes(` ${cmd} `) || 
          queryUpperCase.startsWith(`${cmd} `) || 
          queryUpperCase.includes(`;${cmd} `)) {
        console.error(`Dangerous command detected: ${cmd} in query: ${cleanedQuery}`);
        throw new Error('Unauthorized operation detected in query');
      }
    }

    // Check if it's a MongoDB aggregation query
    const isMongoDbAggregation = (
      (cleanedQuery.includes('db.') && cleanedQuery.includes('.aggregate')) ||
      // Support for array-style aggregation pipelines with various operations
      (cleanedQuery.startsWith('[') && (
        cleanedQuery.includes('$match') || 
        cleanedQuery.includes('$group') || 
        cleanedQuery.includes('$project') || 
        cleanedQuery.includes('$lookup') ||
        cleanedQuery.includes('$sort') ||
        cleanedQuery.includes('$limit')
      )) ||
      (cleanedQuery.includes('aggregate([')) ||
      (cleanedQuery.includes('find('))
    );
    
    // Check if it's a SQL query starting with SELECT
    const isSqlSelect = queryUpperCase.startsWith('SELECT');
    
    // If neither valid MongoDB nor SQL syntax, reject
    if (!isMongoDbAggregation && !isSqlSelect) {
      console.error(`Query doesn't use valid read operation syntax: ${cleanedQuery}`);
      throw new Error('Only read operations are allowed (MongoDB aggregate/find or SQL SELECT)');
    }
    
    // For MongoDB queries, check if they contain write operations
    if (isMongoDbAggregation) {
      const writeOperations = ['$out', '$merge', '$replaceRoot', '$replaceWith'];
      for (const op of writeOperations) {
        if (cleanedQuery.includes(op)) {
          console.error(`MongoDB write operation detected: ${op} in query: ${cleanedQuery}`);
          throw new Error(`Unauthorized MongoDB operation detected: ${op}`);
        }
      }
    }

    return cleanedQuery;
  }

  /**
   * Convert SQL results to natural language response
   * @param {string} userQuery - Original user query
   * @param {string} sqlQuery - Generated SQL query
   * @param {Array} results - SQL query results
   * @returns {Promise<string>} - Natural language response
   */
  async convertResultsToNaturalLanguage(userQuery, sqlQuery, results) {
    try {
      const prompt = `
        You are an inventory assistant that explains database results in natural language.
        
        USER QUESTION: "${userQuery}"
        
        SQL QUERY USED: "${sqlQuery}"
        
        QUERY RESULTS: ${JSON.stringify(results, null, 2)}
        
        Provide a clear, concise response that answers the user's question based on these results.
        - Match the language of the user's question (Arabic, French, English, etc.)
        - Be direct and informative
        - Include relevant numbers and specific product names when appropriate
        - Format lists if needed for readability
        - If results are empty, explain that no matching data was found
        
        YOUR RESPONSE:
      `;

      // Create completion with retry logic
      let retries = 0;
      const maxRetries = 3;
      let error;
      
      while (retries < maxRetries) {
        try {
          const completion = await this.client.chat.completions.create({
            model: this.model,
            messages: [
              { 
                role: 'system', 
                content: 'You are a helpful inventory assistant that explains database results clearly.' 
              },
              { 
                role: 'user', 
                content: prompt 
              }
            ],
            temperature: 0.7,
            max_tokens: 1500
          });
          
          return completion.choices[0].message.content.trim();
        } catch (err) {
          error = err;
          retries++;
          if (retries < maxRetries) {
            // Wait with exponential backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          }
        }
      }
      
      // If we get here, all retries failed
      console.error('Error converting results to natural language after retries:', error);
      throw new Error('Failed to generate natural language response');
    } catch (error) {
      console.error('Error converting results to natural language:', error);
      throw new Error('Failed to generate natural language response');
    }
  }
} 
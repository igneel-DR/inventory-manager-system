import AiService from '../services/aiService.js';
import QueryExecutor from '../utils/queryExecutor.js';

// Initialize services
const aiService = new AiService();
const queryExecutor = new QueryExecutor();

/**
 * Process a natural language query about inventory
 * @route POST /api/chat/query
 * @access Private
 */
export const processQuery = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Query message is required' 
      });
    }

    // Check for potentially harmful operations in the query
    const dangerousKeywords = ['delete', 'drop', 'remove', 'update', 'insert', 'create', 'modify'];
    const isQueryDangerous = dangerousKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    // If the query seems like it might be trying to modify data, respond with a friendly message
    if (isQueryDangerous) {
      // Check more specifically if it looks like a data modification attempt
      if (message.toLowerCase().match(/\b(delete|remove|drop)\s+(a|an|the|one|all|every|from)?\s*(product|supplier|category|item|record|database|inventory)/i)) {
        console.log('Unauthorized operation detected in natural language query');
        return res.status(200).json({
          success: true,
          originalMessage: message,
          response: "I'm sorry, I can only provide information about your inventory. I cannot delete, update, or modify any data. Would you like to view or search for specific inventory items instead?"
        });
      }
    }

    // Step 1: Convert natural language to SQL query
    //console.log(`Processing query: ${message}`);
    let sqlQuery;
    
    // Generate thinking steps to show in UI
    const thinking = [
      "Understanding your question...",
      "Analyzing inventory database schema...",
      "Translating to database query...",
      "Validating query safety..."
    ];
    
    try {
      sqlQuery = await aiService.convertToSQL(message);
      //console.log(`Generated SQL query: ${sqlQuery}`);
    } catch (error) {
      // If the error is about unauthorized operations, return a friendly message
      if (error.message && (error.message.includes('Unauthorized operation') || 
                           error.message.includes('Only read operations'))) {
        return res.status(200).json({
          success: true,
          originalMessage: message,
          thinking: thinking,
          response: "I'm sorry, I can only provide information about your inventory. I cannot delete, update, or modify any data. Would you like to view or search for specific inventory items instead?"
        });
      }
      // Otherwise re-throw the error to be caught by the outer catch block
      throw error;
    }

    // Step 2: Execute the query against the database
    thinking.push("Executing database query...");
    const results = await queryExecutor.executeQuery(sqlQuery);
    //console.log(`Query execution returned ${results.length} results`);

    // Step 3: Convert the results back to natural language
    thinking.push("Formatting results into natural language...");
    thinking.push("Preparing final response...");
    const response = await aiService.convertResultsToNaturalLanguage(
      message,
      sqlQuery,
      results
    );

    // Return the complete response
    return res.status(200).json({
      success: true,
      originalMessage: message,
      sqlQuery: sqlQuery,
      results: results,
      thinking: thinking,
      response: response
    });
  } catch (error) {
    console.error('Error processing natural language query:', error);
    
    // Check if this is a security-related error
    if (error.message && (error.message.includes('Unauthorized operation') || 
                         error.message.includes('Only read operations'))) {
      // Return a friendly message for security errors
      return res.status(200).json({
        success: true,
        message: "I'm sorry, I can only provide information about your inventory. I cannot delete, update, or modify any data. Would you like to view or search for specific inventory items instead?"
      });
    }
    
    // For other errors, return a generic error message
    return res.status(500).json({ 
      success: false, 
      message: 'I encountered an issue processing your request. Could you try asking in a different way?',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get query history for the current user
 * @route GET /api/chat/history
 * @access Private
 */
export const getQueryHistory = async (req, res) => {
  try {
    // In a real implementation, you would fetch from a database
    // For now, we'll return a stub response
    return res.status(200).json({
      success: true,
      history: [] // Would fetch from database in production
    });
  } catch (error) {
    console.error('Error fetching query history:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch query history' 
    });
  }
};

/**
 * Clear query history for the current user
 * @route DELETE /api/chat/history
 * @access Private
 */
export const clearQueryHistory = async (req, res) => {
  try {
    // In a real implementation, you would delete from a database
    // For now, we'll return a success response
    return res.status(200).json({
      success: true,
      message: 'Query history cleared'
    });
  } catch (error) {
    console.error('Error clearing query history:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to clear query history' 
    });
  }
}; 
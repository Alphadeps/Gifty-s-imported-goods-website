/**
 * obfuscation.js
 * Middleware to Base64 encode JSON responses for basic obfuscation.
 */

const obfuscateResponse = (req, res, next) => {
    // DO NOT obfuscate the config endpoint - it's needed for bootstrapping
    if (req.path.includes('/public/config')) {
        return next();
    }

    const originalJson = res.json;

    res.json = function (data) {
        // If data is already a string or we shouldn't obfuscate, call original
        if (typeof data !== 'object' || data === null) {
            return originalJson.call(this, data);
        }

        try {
            // Stringify and Base64 encode the JSON data
            const jsonString = JSON.stringify(data);
            const obfuscatedData = Buffer.from(jsonString).toString('base64');
            
            // Send as a plain object with the obfuscated string
            return originalJson.call(this, { _d: obfuscatedData });
        } catch (error) {
            console.error('Obfuscation Error:', error);
            return originalJson.call(this, data);
        }
    };

    next();
};

module.exports = { obfuscateResponse };

/**
 * security.js
 * Middleware to block access to hidden files (dotfiles) and prevent path traversal attacks.
 */

const blockHiddenFiles = (req, res, next) => {
    const path = req.path;
    const decodedPath = decodeURIComponent(path);

    // 1. Block dotfiles (files or directories starting with .)
    // This catches /.env, /api/.git, etc.
    const hasDotFile = /\/\./.test(decodedPath);

    // 2. Block path traversal sequences
    // This catches /../.env, /api/v1/../../.env, etc.
    const hasPathTraversal = /\.\.\//.test(decodedPath) || /\.\.\\/.test(decodedPath);

    if (hasDotFile || hasPathTraversal) {
        console.warn(`Blocked suspicious request to: ${path} (Decoded: ${decodedPath}) from IP: ${req.ip}`);
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Access to this resource is restricted for security reasons.'
        });
    }

    next();
};

module.exports = { blockHiddenFiles };

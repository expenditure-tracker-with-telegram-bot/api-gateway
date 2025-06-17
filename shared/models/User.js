const userSchemaExample = {
    username: { type: 'String', required: true, unique: true },
    password: { type: 'String', required: true },
    role: { type: 'String', enum: ['user', 'Admin'], default: 'user' },
    created_at: { type: 'Date', default: Date.now },
};

module.exports = userSchemaExample;
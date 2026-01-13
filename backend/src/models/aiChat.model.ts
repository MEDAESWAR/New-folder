import mongoose from 'mongoose';

const aiChatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    role: {
        type: String, // "user" or "assistant"
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    sessionId: {
        type: String,
    },
}, {
    timestamps: true,
});

const AIChat = mongoose.model('AIChat', aiChatSchema);

export default AIChat;

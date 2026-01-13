import mongoose from 'mongoose';

const careerGoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    targetRole: {
        type: String,
        required: true,
    },
    industry: {
        type: String,
    },
    timeline: {
        type: String, // "Short-term", "Long-term"
        required: true,
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        enum: ['active', 'achieved', 'paused'],
        default: 'active',
    },
}, {
    timestamps: true,
});

const CareerGoal = mongoose.model('CareerGoal', careerGoalSchema);

export default CareerGoal;

import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    jobTitle: {
        type: String,
        required: true,
    },
    company: {
        type: String,
    },
    questions: {
        type: Array, // Array of question-answer pairs
        default: [],
    },
    feedback: {
        type: Object, // JSON object for AI feedback
    },
    score: {
        type: Number,
    },
}, {
    timestamps: true,
});

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

export default InterviewSession;

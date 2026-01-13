import mongoose from 'mongoose';

const jobDescriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    company: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
    extractedData: {
        type: Object, // JSON object for AI-extracted skills, etc
    },
    matchScore: {
        type: Number,
    },
}, {
    timestamps: true,
});

const JobDescription = mongoose.model('JobDescription', jobDescriptionSchema);

export default JobDescription;

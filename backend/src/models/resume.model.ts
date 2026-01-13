import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    summary: {
        type: String,
    },
    experience: {
        type: Array, // Array of experience objects
        default: [],
    },
    education: {
        type: Array, // Array of education objects
        default: [],
    },
    skills: {
        type: Array, // Array of skills
        default: [],
    },
    projects: {
        type: Array, // Array of project objects
        default: [],
    },
    template: {
        type: String,
        default: 'minimal',
    },
}, {
    timestamps: true,
});

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;

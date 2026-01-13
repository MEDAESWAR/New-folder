import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    proficiency: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;

const mongoose = require('mongoose');

const DirasaSchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        default: function () {
            return this._id || mongoose.Types.ObjectId();
        },
        required: true,
    },
    teacherName: {
        type: String,
        required: true
    },
    teacherPhone: {
        type: String,
        required: true
    },
    teacherEmail: {
        type: String,
        required: true
    },
    students: [{
        studentName: {
            type: String,
            required: true
        },
        enrollmentNumber: {
            type: String,
            required: true
        },
        studentLevel: {
            type: Number,
            required: true,
            min: 1,
            max: 10
        }
    }],
    studentsCount: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('dirasa', DirasaSchema);

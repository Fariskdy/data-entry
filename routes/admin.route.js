const User = require('../models/user.model')
const router = require('express').Router();
const mongoose = require('mongoose');
const {roles} = require('../utils/constants')
const Dirasa = require('../models/dirasa.model')
const ExcelJS = require('exceljs');


router.get('/users', async (req, res, next) => {
    try {
        const users = await User.find();
        // res.send(users)
        res.render('manage-users', { users })
    } catch (error) {
        next(error)
    }
})
//user profiles
router.get('/user/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash('error', 'Invalid Id');
            res.redirect('/admin/users');
            return;
        }
        const person = await User.findById(id);
        res.render('profile', { person })
    } catch (error) {
        next(error)
    }
})
// update roles
router.post('/update-role', async(req, res, next) => {
    const { id, role } = req.body;
    if (!id || !role) {
        req.flash('error', 'Invalid Request');
        return res.redirect('back')
    }
    //check for valid mongoose object id
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', 'Invalid Id');
        return res.redirect('back')
    }
    //check for valid roles
    const rolesArray = Object.values(roles);
    if (!rolesArray.includes(role)) {
        req.flash('error', 'Invalid Role');
        return res.redirect('back')
    }
    //admins restriction to remove itself
    if (req.user.id === id) {
        req.flash('error', 'Admin cannot be removed or change their role, ask another admin to change role for this admin.');
        return res.redirect('back')
    }
    //finally update user
    const user = await User.findByIdAndUpdate(id, { role: role }, { new: true, runValidators: true })
    req.flash('info', `Role updated for ${user.email} to ${user.role}`)
    res.redirect('back')
})

// dashboard

router.get('/dashboard', (req, res, next) => {
    res.render('dashboard')
})

router.get('/dirasa/teachers', (req, res, next) => {

/// get all teachers from dirasa collection
    Dirasa.find({}).then(teachers => {
        res.render('teachers', { teachers })
    }).catch(err => {
        next(err)
    })   
})

// Route to download teachers data as Excel
router.get('/dirasa/download-teachers-list', async (req, res) => {
    try {
        // Fetch all documents from the 'dirasa' collection
        const teachers = await Dirasa.find();

        // Prepare the data for the Excel sheet
        const tableData = teachers.map(teacher => ({
            teacherName: teacher.teacherName,
            teacherPhone: teacher.teacherPhone,
            teacherEmail: teacher.teacherEmail,
            studentsCount: teacher.studentsCount
        }));

        // Create a workbook and add a worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Teachers');

        // Define the columns
        worksheet.columns = [
            { header: 'Teacher Name', key: 'teacherName' },
            { header: 'Teacher Phone', key: 'teacherPhone' },
            { header: 'Teacher Email', key: 'teacherEmail' },
            { header: 'Students Count', key: 'studentsCount' }
        ];

        // Add data to the worksheet
        tableData.forEach(row => {
            worksheet.addRow(row);
        });

        // Set response headers for Excel file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=teachers.xlsx');

        // Send the workbook as a buffer to the response
        workbook.xlsx.write(res).then(() => {
            res.end();
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});

// Route to get all students in table format
router.get('/dirasa/all-students', async (req, res) => {
    try {
        // Fetch all documents from the 'dirasa' collection
        const teachers = await Dirasa.find();

        // Prepare the data for the table
        const tableData = [];
        teachers.forEach(teacher => {
            teacher.students.forEach(student => {
                tableData.push({
                    teacherName: teacher.teacherName,
                    studentName: student.studentName,
                    enrollmentNumber: student.enrollmentNumber,
                    studentLevel: student.studentLevel
                });
            });
        });

        res.render('students', { tableData });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});

router.get('/dirasa/download-student-list', async (req, res) => {
    try {
        // Fetch all documents from the 'dirasa' collection
        const teachers = await Dirasa.find();

        // Prepare the data for the table
        const tableData = [];
        teachers.forEach(teacher => {
            teacher.students.forEach(student => {
                tableData.push({
                    teacherName: teacher.teacherName,
                    studentName: student.studentName,
                    enrollmentNumber: student.enrollmentNumber,
                    studentLevel: student.studentLevel
                });
            });
        });

        // Create a workbook and add a worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Students');

        // Define the columns
        worksheet.columns = [
            { header: 'Teacher Name', key: 'teacherName' },
            { header: 'Student Name', key: 'studentName' },
            { header: 'Enrollment Number', key: 'enrollmentNumber' },
            { header: 'Level', key: 'studentLevel' }
        ];

        // Add data to the worksheet
        tableData.forEach(row => {
            worksheet.addRow(row);
        });

        // Set response headers for Excel file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');

        // Send the workbook as a buffer to the response
        workbook.xlsx.write(res).then(() => {
            res.end();
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});

module.exports = router
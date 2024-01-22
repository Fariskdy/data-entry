const router = require('express').Router();
const Dirasa = require('../models/dirasa.model');

router.get('/', (req, res, next) => {
    res.render('index');
})

router.get('/dirasa', (req, res, next) => {
    res.render('dirasa');
})


// Define the POST route for saving teacher data
router.post('/dirasa/teacher', async (req, res) => {
    try {
      // Extract data from the request body
      const { teacherName, teacherEmail, teacherPhone, studentsCount } = req.body;
  
      // Create a new Dirasa instance for teacher data
      const dirasaInstance = new Dirasa({
        teacherName,
        teacherEmail,
        teacherPhone,
        studentsCount,
      });
  
      // Save the Dirasa document with teacher data to the database
      const savedTeacher = await dirasaInstance.save();
  
      res.redirect(`/dirasa/add-students/${savedTeacher._id}`);
    } catch (error) {
      console.error('Error saving teacher data:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  

  router.get('/dirasa/add-students/:teacherId', async (req, res, next) => {
    try {
        const { teacherId } = req.params;

        // Use await to wait for the promise to resolve
        const teacher = await Dirasa.findById(teacherId);

        // Check if the teacher was found
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        // Render the 'dirasa-students' view with the teacher information
        res.render('dirasa-students', { teacher });
    } catch (error) {
        console.error('Error retrieving teacher data:', error);
        res.status(500).send('Internal Server Error');
    }
});



  // Define the POST route for saving student data
 router.post('/dirasa/student/:teacherId', async (req, res) => {
    try {
      const { teacherId } = req.params;
  
      // Find the corresponding teacher document in the database
      const teacher = await Dirasa.findById(teacherId);
  
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
  
      // Extract student data from the request body
      const { studentName, enrollmentNumber, studentLevel } = req.body;
  
      // Add the new student to the teacher's students array
      teacher.students.push({ studentName, enrollmentNumber, studentLevel });
  
      // Save the updated teacher document with the new student
      const updatedTeacher = await teacher.save();
  
      res.redirect(`/dirasa/add-students/${updatedTeacher._id}`);
    } catch (error) {
      console.error('Error saving student data:', error);
      res.status(500).send('Internal Server Error');
    }
  });




module.exports = router;
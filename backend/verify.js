import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Quiz from './models/Quiz.js';
import Question from './models/Question.js';
import Result from './models/Result.js';

// Load env
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/online-quiz-app';

async function runVerification() {
  console.log('--- STARTING BACKEND SCHEMA & SCORING VERIFICATION ---');
  
  try {
    // 1. Connect
    await mongoose.connect(MONGO_URI);
    console.log('✔ MongoDB connected successfully.');

    // Clean up past test accounts if any
    await User.deleteMany({ email: 'test_verify@example.com' });
    
    // 2. Create User
    const testUser = await User.create({
      name: 'Test verifier',
      email: 'test_verify@example.com',
      password: 'password123',
      role: 'student',
    });
    console.log(`✔ User model working. Created student: ${testUser.name} (${testUser.email})`);

    // 3. Create Admin
    await User.deleteMany({ email: 'admin_verify@example.com' });
    const adminUser = await User.create({
      name: 'Admin verifier',
      email: 'admin_verify@example.com',
      password: 'password123',
      role: 'admin',
    });
    console.log(`✔ Admin registration working: ${adminUser.name}`);

    // 4. Create Quiz
    const testQuiz = await Quiz.create({
      title: 'JavaScript Closures Integration Test',
      description: 'Verifies closures and lexical scope bindings',
      category: 'Programming',
      difficulty: 'medium',
      timeLimit: 10,
      passingPercentage: 50,
      negativeMarking: true,
      negativeMarkingValue: 0.5,
      createdBy: adminUser._id,
    });
    console.log(`✔ Quiz model working. Created: "${testQuiz.title}"`);

    // 5. Add Questions
    const q1 = await Question.create({
      quizId: testQuiz._id,
      questionText: 'What is a closure?',
      options: [
        'A function combined with its lexical environment',
        'A method to close databases',
        'An HTML closing tag',
        'A browser private tab state'
      ],
      correctAnswers: [0],
      questionType: 'single',
      marks: 2,
    });

    const q2 = await Question.create({
      quizId: testQuiz._id,
      questionText: 'Select all block-scoped variable keywords:',
      options: ['var', 'let', 'const', 'function'],
      correctAnswers: [1, 2], // let and const
      questionType: 'multiple',
      marks: 3,
    });

    // Update totalMarks
    const questions = await Question.find({ quizId: testQuiz._id });
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    testQuiz.totalMarks = totalMarks;
    await testQuiz.save();
    console.log(`✔ Question pool created. Synchronized quiz total marks: ${testQuiz.totalMarks}`);

    // 6. Simulate submission & evaluate
    console.log('\n--- SIMULATING STUDENT SUBMISSION ---');
    
    // Student answers:
    // q1: index 0 (Correct! +2 marks)
    // q2: indices 1, 2 (Correct! +3 marks)
    const answersCorrect = [
      { questionId: q1._id, selectedOptions: [0] },
      { questionId: q2._id, selectedOptions: [1, 2] },
    ];

    let earnedScore = 0;
    const evaluatedAnswers = [];

    const compareArrays = (a, b) => a.length === b.length && a.every(v => b.includes(v)) && b.every(v => a.includes(v));

    for (const question of questions) {
      const selection = answersCorrect.find(ans => ans.questionId.toString() === question._id.toString())?.selectedOptions || [];
      const isCorrect = compareArrays(selection, question.correctAnswers);
      
      if (isCorrect) {
        earnedScore += question.marks;
      } else if (testQuiz.negativeMarking && selection.length > 0) {
        earnedScore -= testQuiz.negativeMarkingValue;
      }

      evaluatedAnswers.push({
        questionId: question._id,
        selectedOptions: selection,
        isCorrect,
      });
    }

    const percentage = Math.round((earnedScore / testQuiz.totalMarks) * 100);
    const passed = percentage >= testQuiz.passingPercentage;

    const resultRecord = await Result.create({
      userId: testUser._id,
      quizId: testQuiz._id,
      score: earnedScore,
      percentage,
      passed,
      answers: evaluatedAnswers,
      timeTaken: 120, // 2 mins
    });

    console.log(`✔ Attempt evaluated & recorded. Score: ${resultRecord.score}/${testQuiz.totalMarks} (${resultRecord.percentage}%). Passed: ${resultRecord.passed}`);

    // Clean up
    await Question.deleteMany({ quizId: testQuiz._id });
    await Result.deleteMany({ quizId: testQuiz._id });
    await Quiz.findByIdAndDelete(testQuiz._id);
    await User.findByIdAndDelete(testUser._id);
    await User.findByIdAndDelete(adminUser._id);
    console.log('✔ Cleaned up temporary test documents.');

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✔ Mongoose connection closed.');
    console.log('--- VERIFICATION COMPLETED ---');
  }
}

runVerification();

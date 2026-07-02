import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a quiz title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a quiz description'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    timeLimit: {
      type: Number,
      required: [true, 'Please add a time limit in minutes'],
      min: [1, 'Time limit must be at least 1 minute'],
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    passingPercentage: {
      type: Number,
      default: 40,
      min: [0, 'Passing percentage cannot be less than 0'],
      max: [100, 'Passing percentage cannot exceed 100'],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    randomizeQuestions: {
      type: Boolean,
      default: false,
    },
    negativeMarking: {
      type: Boolean,
      default: false,
    },
    negativeMarkingValue: {
      type: Number,
      default: 0,
      min: [0, 'Negative marking value must be positive or zero'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;

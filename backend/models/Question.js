import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    questionText: {
      type: String,
      required: [true, 'Please add the question text'],
      trim: true,
    },
    options: {
      type: [String],
      required: [true, 'Please add 4 options'],
      validate: {
        validator: function (val) {
          return val.length === 4;
        },
        message: 'A question must have exactly 4 options',
      },
    },
    correctAnswers: {
      type: [Number], // Array of correct option indices (e.g. [0, 2])
      required: [true, 'Please add correct answer indices'],
      validate: {
        validator: function (val) {
          return val.length > 0 && val.every(v => v >= 0 && v <= 3);
        },
        message: 'Correct answers must contain valid option indices (0-3)',
      },
    },
    questionType: {
      type: String,
      enum: ['single', 'multiple'],
      default: 'single',
    },
    marks: {
      type: Number,
      default: 1,
      min: [1, 'Marks must be at least 1'],
    },
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model('Question', questionSchema);
export default Question;

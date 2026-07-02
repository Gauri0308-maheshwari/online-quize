import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import {
  FiCheck,
  FiX,
  FiAward,
  FiClock,
  FiPercent,
  FiFileText,
  FiArrowLeft,
  FiDownload,
  FiTrendingUp,
} from 'react-icons/fi';

const QuizResult = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResultAndLeaderboard();
  }, [id]);

  const fetchResultAndLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/results/${id}`);
      if (res.data.success) {
        setResult(res.data.data);
        
        // Fetch leaderboard for this quiz
        const lbRes = await api.get(`/results/leaderboard/${res.data.data.quiz._id}`);
        if (lbRes.data.success) {
          setLeaderboard(lbRes.data.data);
        }
      }
    } catch (error) {
      toast.error('Failed to load attempt result details');
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = () => {
    if (!result || !result.passed) return;

    try {
      // Landscape canvas size: 600 x 400 pixels
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [600, 400],
      });

      // 1. Draw outer primary purple border
      doc.setDrawColor(109, 40, 217); // Purple 700
      doc.setLineWidth(10);
      doc.rect(10, 10, 580, 380);

      // 2. Draw inner thin gold border
      doc.setDrawColor(217, 119, 6); // Amber 600
      doc.setLineWidth(2);
      doc.rect(20, 20, 560, 360);

      // 3. Title Text
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(26);
      doc.setTextColor(109, 40, 217); // Purple 700
      doc.text('CERTIFICATE OF MERIT', 300, 75, { align: 'center' });

      // 4. Subtitle Text
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(14);
      doc.setTextColor(75, 85, 99); // Gray 600
      doc.text('This is proudly presented to', 300, 120, { align: 'center' });

      // 5. User Name
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(17, 24, 39); // Gray 900
      doc.text(result.user.name.toUpperCase(), 300, 160, { align: 'center' });

      // 6. Criteria
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(13);
      doc.setTextColor(75, 85, 99);
      doc.text('for demonstrating exceptional understanding by passing', 300, 200, { align: 'center' });

      // 7. Quiz Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(17, 24, 39);
      doc.text(result.quiz.title, 300, 230, { align: 'center' });

      // 8. Stats Line
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(107, 114, 128); // Gray 500
      const formattedDate = new Date(result.submittedAt).toLocaleDateString();
      doc.text(`Score Achieved: ${result.percentage}%   |   Issued on: ${formattedDate}`, 300, 265, {
        align: 'center',
      });

      // 9. Seal Graphic (Faux Gold Badge)
      doc.setFillColor(245, 158, 11); // Amber 500
      doc.circle(300, 320, 20, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('PASS', 300, 323, { align: 'center' });

      // 10. Signature lines
      doc.setDrawColor(209, 213, 219); // Gray 300
      doc.setLineWidth(1);
      doc.line(80, 335, 200, 335);
      doc.line(400, 335, 520, 335);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text('Date of Issue', 140, 348, { align: 'center' });
      doc.text('QuizPulse Authority', 460, 348, { align: 'center' });

      // Download PDF
      const fileName = `Certificate_${result.quiz.title.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export certificate');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-8 page-transition">
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="p-2 text-gray-500 hover:bg-gray-150 dark:hover:bg-gray-800 rounded-xl transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Attempt Summary</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Review detailed question logs and scorecard results
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Scorecard panel */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Background glows */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl"></div>
            
            <div className="space-y-4 text-center md:text-left">
              <div>
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Performance Report
                </span>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                  {result.quiz.title}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm font-semibold text-gray-650 dark:text-gray-400">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <FiClock />
                  <span>Time Taken: {formatTime(result.timeTaken)}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <FiFileText />
                  <span>Total Marks: {result.quiz.totalMarks}</span>
                </div>
              </div>

              {result.passed ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/30 rounded-full text-xs font-bold">
                  Status: Passed
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-955/20 text-red-650 dark:text-red-405 border border-red-100/30 rounded-full text-xs font-bold">
                  Status: Failed
                </div>
              )}
            </div>

            {/* Circular Progress Gauge */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* SVG Circle indicator */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    className="stroke-gray-200 dark:stroke-gray-800"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    className={result.passed ? "stroke-emerald-555" : "stroke-red-500"}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={326.7}
                    strokeDashoffset={326.7 - (326.7 * result.percentage) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {result.percentage}%
                  </span>
                  <span className="text-xs font-bold text-gray-400">Score</span>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Score: {result.score} / {result.quiz.totalMarks} Marks
              </span>
            </div>
          </div>

          {/* Certificate Download CTA if passed */}
          {result.passed && (
            <div className="glass-card rounded-3xl p-6 shadow-lg border border-primary-500/20 bg-gradient-to-r from-primary-500/10 to-indigo-505/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <FiAward className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">E-Certificate Available</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Congratulations! You have passed the quiz and unlocked your certificate.
                  </p>
                </div>
              </div>
              <button
                onClick={generateCertificate}
                className="w-full sm:w-auto px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
              >
                <FiDownload />
                <span>Download Certificate</span>
              </button>
            </div>
          )}

          {/* Detailed Question Review */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Question Logs & Corrections</h3>
            {result.answers.map((ans, idx) => (
              <div
                key={ans.questionId}
                className={`glass-card p-5 sm:p-6 rounded-3xl shadow-md border-l-4 ${
                  ans.isCorrect ? 'border-l-emerald-500' : 'border-l-red-500'
                } space-y-4`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-xs font-bold text-gray-450 dark:text-gray-500">Question {idx + 1}</span>
                    <h4 className="text-base font-bold text-gray-850 dark:text-white mt-1">
                      {ans.questionText}
                    </h4>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                      ans.isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450'
                        : 'bg-red-50 dark:bg-red-955/20 text-red-650 dark:text-red-405'
                    }`}
                  >
                    {ans.isCorrect ? `+${ans.marks} Marks` : '0 Marks'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ans.options.map((opt, oIdx) => {
                    const isUserSelected = ans.selectedOptions.includes(oIdx);
                    const isCorrectAnswer = ans.correctAnswers.includes(oIdx);

                    let optionStyle = 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-150 dark:border-gray-800 text-gray-600 dark:text-gray-400';
                    let icon = null;

                    if (isCorrectAnswer) {
                      optionStyle = 'bg-emerald-50/50 dark:bg-emerald-955/10 border-emerald-300/40 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 font-semibold';
                      icon = <FiCheck className="text-emerald-650 dark:text-emerald-400 w-4 h-4 shrink-0" />;
                    } else if (isUserSelected && !isCorrectAnswer) {
                      optionStyle = 'bg-red-50/50 dark:bg-red-955/10 border-red-300/40 dark:border-red-900/30 text-red-800 dark:text-red-405 font-semibold';
                      icon = <FiX className="text-red-655 dark:text-red-405 w-4 h-4 shrink-0" />;
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`p-3.5 rounded-xl border text-sm flex items-center justify-between gap-3 ${optionStyle}`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5.5 h-5.5 rounded-lg bg-white dark:bg-gray-850 flex items-center justify-center font-bold text-xs border border-gray-200 dark:border-gray-750">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="truncate">{opt}</span>
                        </div>
                        {icon}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz Leaderboard */}
        <div className="lg:col-span-4 glass-card p-6 sm:p-7 rounded-3xl shadow-lg space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
            <FiTrendingUp className="text-primary-600 dark:text-primary-400" />
            <h3 className="text-base font-bold text-gray-850 dark:text-white">Leaderboard</h3>
          </div>

          <div className="space-y-4">
            {leaderboard.length > 0 ? (
              leaderboard.map((leader, index) => (
                <div
                  key={leader._id}
                  className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-900/35 border border-gray-150/40 dark:border-gray-800/40 rounded-2xl"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {/* Rank Badge */}
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0
                          ? 'bg-amber-100 text-amber-800'
                          : index === 1
                          ? 'bg-slate-100 text-slate-800'
                          : index === 2
                          ? 'bg-orange-100 text-orange-850'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </span>

                    {/* Avatar */}
                    {leader.user.profilePicture ? (
                      <img
                        src={leader.user.profilePicture}
                        alt={leader.user.name}
                        className="w-8 h-8 rounded-lg object-cover border border-primary-500/20"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-xs border border-primary-500/10">
                        {leader.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <span className="text-sm font-semibold truncate text-gray-800 dark:text-gray-200">
                      {leader.user.name}
                    </span>
                  </div>

                  <span className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
                    {leader.score} Pts ({leader.percentage}%)
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-xs text-gray-500 py-4">No records found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;

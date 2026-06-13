import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation/Navigation";
import CoursePage from "./pages/CoursePage/CoursePage";
import CourseDetailPage from "./pages/CoursePage/CourseDetailPage";
import CheckInPage from "./pages/CheckInPage/CheckInPage";
import EvaluationPage from "./pages/EvaluationPage/EvaluationPage";
import MessagePage from "./pages/MessagePage/MessagePage";
import ProgressPage from "./pages/ProgressPage/ProgressPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import BookingPage from "./pages/BookingPage/BookingPage";
import RecordPage from "./pages/RecordPage/RecordPage";
import ReportPage from "./pages/ReportPage/ReportPage";
import ReviewPage from "./pages/ReviewPage/ReviewPage";
import { useInitializeData } from "./hooks/useInitializeData";

function Home() {
  return <CoursePage />;
}

function App() {
  useInitializeData();

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<CoursePage />} />
          <Route path="/course/:id" element={<CourseDetailPage />} />
          <Route path="/record/:courseId" element={<RecordPage />} />
          <Route path="/checkin" element={<CheckInPage />} />
          <Route path="/evaluation" element={<EvaluationPage />} />
          <Route path="/messages" element={<MessagePage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/review" element={<ReviewPage />} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  );
}

export default App;

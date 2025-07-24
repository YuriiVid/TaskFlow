import { ArrowRight, CheckCircle, Layout, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { FeatureCard } from "@shared";

import "./styles.css";

const MainPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <nav className="nav-bar">
        <div className="section-container">
          <div className="nav-content">
            <div className="flex items-center">
              <Layout className="h-8 w-8 text-teal-500" />
              <span className="ml-2 text-xl font-semibold">TaskFlow</span>
            </div>
            <div className="nav-link-container">
              <Link to="/login" className="btn-link">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="section-container py-10 text-center">
        <h1 className="hero-heading">
          Manage projects with
          <span className="block text-teal-500">TaskFlow</span>
        </h1>
        <p className="hero-subtext">
          The most intuitive way to organize your work. Collaborate, manage projects, and reach new productivity peaks.
        </p>
        <div className="hero-button-wrapper">
          <Link to="/register" className="btn-primary-lg">
            Get started
            <ArrowRight className="ml-2" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="bg-gray-50 py-10">
        <div className="section-container">
          <div className="feature-grid">
            <FeatureCard
              icon={Layout}
              title="Intuitive Interface"
              description="Simple and clean design that helps you focus on what matters most."
            />
            <FeatureCard
              icon={Users}
              title="Team Collaboration"
              description="Work together seamlessly with your team members in real-time."
            />
            <FeatureCard
              icon={CheckCircle}
              title="Task Management"
              description="Organize tasks with our powerful Kanban board system."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;

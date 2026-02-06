import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { FieldButton } from "@/components/ui/FieldButton";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-6 text-center">
      <div className="app-container">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <span className="text-5xl font-black text-primary">404</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-8 max-w-sm">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex gap-3">
            <FieldButton
              variant="outline"
              icon={<ArrowLeft className="w-5 h-5" />}
              onClick={() => navigate(-1)}
            >
              Go Back
            </FieldButton>
            <FieldButton
              variant="primary"
              icon={<Home className="w-5 h-5" />}
              onClick={() => navigate('/field')}
            >
              Home
            </FieldButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

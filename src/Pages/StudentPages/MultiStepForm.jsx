import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StudentInfoForm from "./StudentInfoForm";
import HallSeatForm from "./HallSeatForm";

const MultiStepForm = ({ onClose }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        matricNumber: "",
        department: "",
        level: "",
        exam: "",
        hall: "",
        seat: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = async (e) => {
        e.preventDefault();

        if (step === 1) {
            // Save student info to Firebase
            const user = auth.currentUser;
            if (!user) {
                toast.error("You must be logged in to submit the form.");
                return;
            }

            try {
                await addDoc(collection(db, "studentInfo"), {
                    ...formData,
                    userId: user.uid, // Link to the logged-in user
                });
                toast.success("Student information saved successfully!");
                setStep(step + 1); // Move to the next step
            } catch (error) {
                console.error("Error saving student info:", error);
                toast.error("Failed to save student information. Please try again.");
            }
        } else {
            setStep(step + 1); // Move to the next step (if there are more steps)
        }
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const submitForm = async (e) => {
        e.preventDefault();

        // Save hall and seat selection to Firebase
        const user = auth.currentUser;
        if (!user) {
            toast.error("You must be logged in to submit the form.");
            return;
        }

        try {
            await addDoc(collection(db, "seatAllocations"), {
                ...formData,
                userId: user.uid, // Link to the logged-in user
            });
            toast.success("Hall and seat selection saved successfully!");
            onClose(); // Close the form
        } catch (error) {
            console.error("Error saving hall and seat selection:", error);
            toast.error("Failed to save hall and seat selection. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <ToastContainer />
            {step === 1 && (
                <StudentInfoForm
                    formData={formData}
                    handleChange={handleChange}
                    nextStep={nextStep}
                />
            )}
            {step === 2 && (
                <HallSeatForm
                    formData={formData}
                    handleChange={handleChange}
                    prevStep={prevStep}
                    submitForm={submitForm}
                />
            )}
        </div>
    );
};

export default MultiStepForm;
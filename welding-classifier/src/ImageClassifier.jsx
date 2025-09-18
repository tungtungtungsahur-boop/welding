import { useState, useEffect } from "react";
import * as tmImage from "@teachablemachine/image";

function ImageClassifier() {
    const [model, setModel] = useState(null);
    const [maxPredictions, setMaxPredictions] = useState(0);
    const [imageFile, setImageFile] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [animatedWidths, setAnimatedWidths] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadModel = async () => {
            const loadedModel = await tmImage.load("model.json", "metadata.json");
            setModel(loadedModel);
            setMaxPredictions(loadedModel.getTotalClasses());
            console.log("Model loaded!");
        };
        loadModel();
    }, []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageFile(URL.createObjectURL(file));
        setPredictions([]); // reset previous predictions
        setAnimatedWidths([]); // reset animated widths
        classifyImage(file);
    };

    const classifyImage = async (file) => {
        if (!model) return;

        setIsLoading(true);

        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
            const prediction = await model.predict(img);
            const results = prediction.map((p) => ({
                className: p.className,
                probability: Math.round(p.probability * 100),
            }));
            setPredictions(results);

            // Animate widths after small delay
            setAnimatedWidths(results.map(() => 0));
            setTimeout(() => {
                setAnimatedWidths(results.map((r) => r.probability));
            }, 100);

            setIsLoading(false);
        };
    };

    const colors = ["#16A34A", "#DC2626", "#F59E0B", "#2563EB", "#8B5CF6"];

    return (
        <div className="flex flex-col items-center min-h-[86vh] bg-background p-8 space-y-8 justify-center w-full lg:w-md ">
            {/* Upload Card */}
            <div className="w-full max-w-sm p-10 bg-surface rounded-2xl shadow-xl flex flex-col items-center border border-border">
                <h2 className="text-2xl font-bold text-text mb-6">Check your weld!</h2>

                {/* Custom Upload Button */}
                <label className="w-full cursor-pointer">
                    <div className="p-3 text-center bg-primary hover:bg-primary-hover text-text rounded-lg transition-all duration-200 shadow-md">
                        {imageFile ? "Change Image" : "Upload Image"}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                </label>

                {/* Uploaded image */}
                {imageFile && (
                    <img
                        src={imageFile}
                        alt="Uploaded"
                        className="w-auto rounded-2xl shadow-lg mt-6 border border-transparent max-h-23"
                    />
                )}

                {/* Loading spinner */}
                {isLoading && (
                    <div className="flex justify-center items-center mt-6">
                        <div className="w-10 h-10 border-4 border-t-primary border-border rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {/* Predictions Card */}
            {predictions.length > 0 && (
                <div className="w-full max-w-sm p-10 bg-surface rounded-2xl shadow-xl border border-border">
                    <h2 className="text-2xl font-bold text-text mb-6 text-center">Predictions</h2>
                    <div className="space-y-5">
                        {predictions.map((p, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between text-text mb-1 font-medium">
                                    <span>{p.className}</span>
                                    <span>{p.probability}%</span>
                                </div>
                                <div className="w-full bg-surface-light h-4 rounded-full overflow-hidden">
                                    <div
                                        className={`h-4 rounded-full transition-all duration-[2000ms] ease-in-out ${p.className === 'good_weld' ? 'bg-success' :
                                                p.className === 'crack' ? 'bg-danger' :
                                                    p.className === 'porosity' ? 'bg-warning' :
                                                        'bg-primary' // Fallback
                                            }`}
                                        style={{ width: `${animatedWidths[idx] || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ImageClassifier;

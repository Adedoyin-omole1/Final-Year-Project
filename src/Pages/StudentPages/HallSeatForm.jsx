const HallSeatForm = ({ formData, handleChange, prevStep, submitForm }) => {
    return (
        <div className="p-6 max-w-2xl w-full">
            <form onSubmit={submitForm} className="bg-white p-8 shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold mb-6 text-center">Select Hall and Seat</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Select Hall</label>
                        <select
                            name="hall"
                            value={formData.hall}
                            required
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Choose Hall --</option>
                            <option value="Hall A">Hall A</option>
                            <option value="Hall B">Hall B</option>
                            <option value="Hall C">Hall C</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Select Seat</label>
                        <select
                            name="seat"
                            value={formData.seat}
                            required
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Choose Seat --</option>
                            <option value="Seat 1">Seat 1</option>
                            <option value="Seat 2">Seat 2</option>
                            <option value="Seat 3">Seat 3</option>
                        </select>
                    </div>

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={prevStep}
                            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all"
                        >
                            Previous
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default HallSeatForm;
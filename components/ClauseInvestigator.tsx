import React, { useState } from 'react';
import { explainClause } from '../services/geminiService';
import type { GeminiExplainResponse } from '../services/geminiService';
import { SearchIcon } from './icons';

// Using a markdown-to-jsx or similar library would be better,
// but for simplicity and no new dependencies, we'll do a basic render.
const AiResponse: React.FC<{ content: string }> = ({ content }) => {
    // A simple parser to make the markdown-like text look better.
    const lines = content.split('\n').map((line, index) => {
        if (line.startsWith('### **')) {
            return <h3 key={index} className="text-lg font-bold text-teal-300 mt-4 mb-2">{line.replace(/### \*\*/g, '').replace(/\*\*/g, '')}</h3>;
        }
        if (line.trim() === '') {
            return <br key={index} />;
        }
        return <p key={index} className="text-slate-300">{line}</p>;
    });

    return <div className="space-y-1">{lines}</div>;
};

const ClauseInvestigator: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState('');
    const [error, setError] = useState('');

    const exampleQueries = [
        "AWS D1.1 clause 6.9 for visual inspection",
        "Difference between PQR and WPS",
        "What is undercut in welding?",
    ];

    const handleQuery = async (queryString: string) => {
        if (!queryString) return;
        setIsLoading(true);
        setError('');
        setResponse('');
        try {
            const geminiResult = await explainClause(queryString);
            setResponse(`### **1. The Code, Simplified**\n${geminiResult.simplified}\n\n### **2. Practical Application**\n${geminiResult.practical}\n\n### **3. Key Takeaway**\n${geminiResult.takeaway}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleQuery(query);
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                <SearchIcon className="h-6 w-6 mr-2 text-teal-400" />
                AI Code Mentor
            </h3>
            <p className="text-sm text-slate-400 mb-4">Have a question about a welding code or standard? Get a clear explanation.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                 <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., Explain porosity acceptance criteria in API 1104"
                    className="w-full h-24 bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
                    aria-label="Ask the AI Code Mentor"
                />
                 <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-slate-400 self-center">Try:</span>
                    {exampleQueries.map((ex) => (
                         <button
                            key={ex}
                            type="button"
                            onClick={() => { setQuery(ex); handleQuery(ex); }}
                            className="text-xs bg-slate-700 hover:bg-slate-600 text-teal-300 px-2 py-1 rounded-md transition-colors"
                         >
                            {ex}
                        </button>
                    ))}
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !query}
                    className="w-full flex justify-center items-center bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Thinking...
                        </>
                    ) : 'Explain'}
                </button>
            </form>

            {error && <p className="text-sm text-red-400 mt-4">{error}</p>}

            {response && (
                <div className="mt-6 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                   <AiResponse content={response} />
                </div>
            )}
        </div>
    );
};

export default ClauseInvestigator;
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import "./QuoteList.css";

const QuoteList = () => {
  const [quote, setQuote] = useState(null);
  const [language, setLanguage] = useState("en");

  // Wrap fetchQuote in useCallback to prevent unnecessary re-creation
  const fetchQuote = useCallback(async (id = null) => {
    try {
      let url = `https://techplement-u9bt.onrender.com/api/quotes/today?lang=${language}`;
      if (id) {
        url += `&id=${id}`; // Pass the quote ID if available
      }

      const response = await axios.get(url);
      setQuote(response.data);
    } catch (error) {
      console.error("Error fetching today's quote:", error);
    }
  }, [language]); // Only changes when language changes

  // Fetch the quote on mount and when language changes
  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "hi" : "en";
    setLanguage(newLanguage);
    if (quote) {
      fetchQuote(quote.id); // Pass the existing quote ID to retain the same quote
    }
  };

  return (
    <div>
      <button onClick={toggleLanguage}>
        Switch to {language === "en" ? "Hindi" : "English"}
      </button>
      {quote ? (
        <p className="quote-container">"{quote.content}" - {quote.author}</p>
      ) : (
        <p className="quote-container">"No quote available for today."</p>
      )}
    </div>
  );
};

export default QuoteList;

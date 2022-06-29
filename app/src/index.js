import React from 'react';
import ReactDOM from 'react-dom/client';
import './gui/assets/index.css';
import {
  BrowserRouter as Router, Route, Routes,
  // Navigate,
} from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import Home from './gui/components/Home';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <div>
    <React.StrictMode>
      <Router>
        <Routes>
          <Route exact path="/" element={<Home />} />
          {/* <Route path="*" element={<Navigate to="/HomePage" replace />} /> */}
        </Routes>
      </Router>
    </React.StrictMode>
    ,
  </div>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

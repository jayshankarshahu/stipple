import React from 'react';
import ReactDOM from 'react-dom/client';
import { TimelineApp } from './TimelineApp';
import '../index.css';
import './timeline-base.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <TimelineApp />
    </React.StrictMode>
);

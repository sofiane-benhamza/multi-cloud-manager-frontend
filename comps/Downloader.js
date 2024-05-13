import React from 'react';
import { saveAs } from 'file-saver';

const Downloader = ({ content, name, title }) => {
    const handleDownload = () => {
        const file = new Blob([content], { type: 'application/x-x509-ca-cert' });
        saveAs(file, name);
    };

    return (
        <button className="btn btn-dark w-100"  onClick={handleDownload}>
            <i class="bi bi-download mx-2"></i>{title}
        </button>
    );
};

export default Downloader;

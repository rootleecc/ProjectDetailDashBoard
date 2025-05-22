import React from 'react';
import ExcelViewer from './components/ExcelViewer';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl">
          <ExcelViewer />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
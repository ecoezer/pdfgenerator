import MenuBuilder from './components/MenuBuilder';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Print-Ready Menu PDF Generator</h1>
        <p className="subtitle">Professional CMYK PDFs for Commercial Printing</p>
      </header>
      <MenuBuilder />
    </div>
  );
}

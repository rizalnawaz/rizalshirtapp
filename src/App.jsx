import { useState, useRef } from "react";
import { Button } from "./components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ShirtMarkerApp() {
  const [measurements, setMeasurements] = useState({
    neck: "",
    chest: "",
    waist: "",
    shoulder: "",
    sleeve: "",
    shirtLength: "",
    fabricWidth: "150", // default in cm
  });

  const canvasRef = useRef(null);

  const handleChange = (e) => {
    setMeasurements({ ...measurements, [e.target.name]: e.target.value });
  };

  const drawSeamAllowance = (ctx, x, y, width, height) => {
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);
    ctx.setLineDash([]);
  };

  const handleGenerate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const chest = parseFloat(measurements.chest);
    const shoulder = parseFloat(measurements.shoulder);
    const sleeve = parseFloat(measurements.sleeve);
    const shirtLength = parseFloat(measurements.shirtLength);
    const neck = parseFloat(measurements.neck);
    const fabricWidth = parseFloat(measurements.fabricWidth);

    if (!chest || !shoulder || !sleeve || !shirtLength || !neck || !fabricWidth) {
      alert("Please enter valid measurements.");
      return;
    }

    const startX = 50;
    const startY = 50;
    const gap = 10;
    let currentX = startX;
    let currentY = startY;

    const layout = [
      { name: "Front Panel", width: chest, height: shirtLength, color: "#a0c4ff" },
      { name: "Back Panel", width: chest, height: shirtLength, color: "#ffadad" },
      { name: "Sleeve", width: shoulder, height: sleeve, color: "#bdb2ff" },
      { name: "Collar", width: neck * 2, height: 10, color: "#caffbf" },
    ];

    layout.forEach((piece) => {
      if (currentX + piece.width > startX + fabricWidth) {
        currentX = startX;
        currentY += 150; // simulate roll advancement
      }

      ctx.fillStyle = piece.color;
      ctx.fillRect(currentX, currentY, piece.width, piece.height);
      ctx.strokeRect(currentX, currentY, piece.width, piece.height);
      drawSeamAllowance(ctx, currentX, currentY, piece.width, piece.height);
      ctx.fillStyle = "#000";
      ctx.fillText(piece.name, currentX, currentY - 5);

      currentX += piece.width + gap;
    });

    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = "#888";
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, canvas.height - 20);
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.fillText("Fabric Width: " + fabricWidth + "cm", startX + 5, canvas.height - 10);
    ctx.setLineDash([]);
    ctx.strokeStyle = "#000";
  };

  const handleExportPDF = async () => {
    const canvas = canvasRef.current;
    const pdf = new jsPDF();
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 10, 10, 190, 100);
    pdf.save("shirt-marker.pdf");
  };

  const handleExportSVG = () => {
    const chest = parseFloat(measurements.chest);
    const shoulder = parseFloat(measurements.shoulder);
    const sleeve = parseFloat(measurements.sleeve);
    const shirtLength = parseFloat(measurements.shirtLength);
    const neck = parseFloat(measurements.neck);
    const fabricWidth = parseFloat(measurements.fabricWidth);

    if (!chest || !shoulder || !sleeve || !shirtLength || !neck || !fabricWidth) {
      alert("Please enter valid measurements.");
      return;
    }

    const startX = 50;
    const startY = 50;
    const gap = 10;
    let currentX = startX;
    let currentY = startY;

    const layout = [
      { name: "Front Panel", width: chest, height: shirtLength, color: "#a0c4ff" },
      { name: "Back Panel", width: chest, height: shirtLength, color: "#ffadad" },
      { name: "Sleeve", width: shoulder, height: sleeve, color: "#bdb2ff" },
      { name: "Collar", width: neck * 2, height: 10, color: "#caffbf" },
    ];

    let svgContent = `<svg width='1000' height='800' xmlns='http://www.w3.org/2000/svg'>`;

    layout.forEach((piece) => {
      if (currentX + piece.width > startX + fabricWidth) {
        currentX = startX;
        currentY += 150;
      }

      svgContent += `
        <rect x='${currentX}' y='${currentY}' width='${piece.width}' height='${piece.height}' fill='${piece.color}' stroke='black'/>
        <text x='${currentX}' y='${currentY - 5}' font-size='10' fill='black'>${piece.name}</text>
        <rect x='${currentX - 1}' y='${currentY - 1}' width='${piece.width + 2}' height='${piece.height + 2}' fill='none' stroke='black' stroke-dasharray='5,5'/>
      `;

      currentX += piece.width + gap;
    });

    svgContent += `<line x1='${startX}' y1='${startY}' x2='${startX}' y2='780' stroke='#888' stroke-dasharray='2,4'/>
                   <text x='${startX + 5}' y='790' font-size='10' fill='black'>Fabric Width: ${fabricWidth}cm</text>`;
    svgContent += `</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "shirt-marker.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Shirt Marker Generator</h1>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(measurements).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium capitalize">{key}</label>
            <input
              type="number"
              name={key}
              value={value}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
              placeholder={`Enter ${key} (cm)`}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-6">
        <Button onClick={handleGenerate} className="w-full">
          Generate Marker
        </Button>
        <Button onClick={handleExportPDF} className="w-full" variant="outline">
          Export as PDF
        </Button>
        <Button onClick={handleExportSVG} className="w-full" variant="secondary">
          Export as SVG
        </Button>
      </div>
      <div className="mt-6">
        <canvas
          ref={canvasRef}
          width={1000}
          height={800}
          className="border rounded w-full"
        ></canvas>
      </div>
    </div>
  );
}

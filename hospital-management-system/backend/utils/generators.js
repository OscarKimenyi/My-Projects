function generatePatientId() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `PAT${timestamp}${random}`;
}

function generateAppointmentId() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `APT${timestamp}${random}`;
}

// Phase 2 generators
function generateDrugId() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `DRG${timestamp}${random}`;
}

function generateLabTestId() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `LAB${timestamp}${random}`;
}

function generatePrescriptionId() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `RX${timestamp}${random}`;
}

function generateBillId() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `BL${timestamp}${random}`;
}

module.exports = {
  generatePatientId,
  generateAppointmentId,
  generateDrugId,
  generateLabTestId,
  generatePrescriptionId,
  generateBillId,
};

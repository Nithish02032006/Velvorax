const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a PDF for a new registration
 * @param {Object} data - The registration data
 * @returns {Promise<string>} - The path to the generated PDF
 */
const generateRegistrationPDF = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const filename = `registration_${Date.now()}.pdf`;
            const filePath = path.join(__dirname, '../temp', filename);

            // Ensure temp directory exists
            if (!fs.existsSync(path.join(__dirname, '../temp'))) {
                fs.mkdirSync(path.join(__dirname, '../temp'));
            }

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Header
            doc.fontSize(25).text('Velvorax Registration Form', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown(2);

            // Section: Personal Information
            doc.fontSize(18).fillColor('#FFD700').text('1. Personal Information', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).fillColor('black');
            doc.text(`Full Name: ${data.name || 'N/A'}`);
            doc.text(`Email Address: ${data.email || 'N/A'}`);
            doc.text(`Phone: ${data.phone || 'N/A'}`);
            doc.text(`Role in Company: ${data.roleInCompany || 'N/A'}`);
            doc.moveDown();

            // Section: Company Information
            doc.fontSize(18).fillColor('#FFD700').text('2. Company Information', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).fillColor('black');
            doc.text(`Company Name: ${data.companyName || 'N/A'}`);
            doc.text(`Website: ${data.website || 'N/A'}`);
            doc.text(`Country: ${data.country || 'N/A'}`);
            doc.text(`Industry: ${data.industry || 'N/A'}`);
            doc.text(`Team Size: ${data.employeesCount || 'N/A'}`);
            doc.moveDown();

            // Section: Project Requirements
            doc.fontSize(18).fillColor('#FFD700').text('3. Project Requirements', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).fillColor('black');
            doc.text(`Services Needed: ${Array.isArray(data.servicesNeeded) ? data.servicesNeeded.join(', ') : (data.servicesNeeded || 'N/A')}`);
            doc.text(`Budget Range: ${data.budgetRange || 'N/A'}`);
            doc.text(`Project Timeline: ${data.projectTimeline || 'N/A'}`);
            doc.moveDown();

            // Section: Additional Details
            doc.fontSize(18).fillColor('#FFD700').text('4. Additional Details', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).fillColor('black');
            doc.text(`Referral Source: ${data.referralSource || 'N/A'}`);
            doc.text(`Preferred Language: ${data.preferredLanguage || 'N/A'}`);
            doc.text(`Time Zone: ${data.timezone || 'N/A'}`);
            doc.moveDown(2);

            // Footer
            doc.fontSize(10).fillColor('grey').text('© 2026 Velvorax Software Solutions - Automated Lead Capture System', { align: 'center' });

            doc.end();

            stream.on('finish', () => {
                resolve(filePath);
            });

            stream.on('error', (err) => {
                reject(err);
            });

        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { generateRegistrationPDF };

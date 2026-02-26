const logger = require('../utils/logger');
const db = require('../models');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit-table');


exports.generateReliefExcel = async (req, res) => {
    try {
        let whereClause = {};

        
        if (req.user.role === 'District Officer') {
            whereClause.district = req.user.district;
        } else if (req.user.role === 'Division Officer') {
            whereClause.dsDivision = req.user.dsDivision;
        }
        

        const requests = await db.ReliefRequest.findAll({
            where: whereClause,
            include: [
                { model: db.User, as: 'enumerator', attributes: ['username', 'id'] },
                { model: db.User, as: 'actioner', attributes: ['username'] },
                { model: db.User, as: 'assignedVolunteer', attributes: ['username'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Relief Requests');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'GN Division', key: 'gnDivision', width: 20 },
            { header: 'DS Division', key: 'dsDivision', width: 20 },
            { header: 'GN ID', key: 'gnId', width: 15 },
            { header: 'Household ID', key: 'householdId', width: 20 },
            { header: 'Census Block', key: 'censusBlock', width: 15 },
            { header: 'Census Unit', key: 'censusUnit', width: 15 },
            { header: 'Incident Type', key: 'incidentType', width: 20 },
            { header: 'Incident Date', key: 'incidentDate', width: 15 },
            { header: 'Ownership', key: 'ownershipStatus', width: 15 },
            { header: 'Is Estate', key: 'isEstate', width: 10 },
            { header: 'Damage Zone', key: 'damageZone', width: 20 },
            { header: 'Severity', key: 'damageSeverity', width: 15 },
            { header: 'Relief Amount', key: 'reliefAmount', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Bank Name', key: 'bankName', width: 20 },
            { header: 'Branch Name', key: 'branchName', width: 20 },
            { header: 'Account Holder', key: 'accountHolder', width: 25 },
            { header: 'Account Number', key: 'accountNumber', width: 20 },
            { header: 'Account NIC', key: 'accountNic', width: 15 },
            { header: 'Remarks', key: 'remarks', width: 40 },
            { header: 'Entered By', key: 'enumerator', width: 20 },
            { header: 'Enumerator ID', key: 'enumeratorId', width: 15 },
            { header: 'Action By', key: 'actioner', width: 20 },
            { header: 'Assigned Volunteer', key: 'assignedVolunteer', width: 20 },
            { header: 'Created Date', key: 'createdAt', width: 25 }
        ];

        requests.forEach(req => {
            worksheet.addRow({
                id: req.id,
                gnDivision: req.gnDivision,
                dsDivision: req.dsDivision,
                gnId: req.gnId || 'N/A',
                householdId: req.householdId || 'N/A',
                censusBlock: req.censusBlock || 'N/A',
                censusUnit: req.censusUnit || 'N/A',
                incidentType: req.incidentType,
                incidentDate: req.incidentDate,
                ownershipStatus: req.ownershipStatus,
                isEstate: req.isEstate ? 'Yes' : 'No',
                damageZone: req.damageZone || 'N/A',
                damageSeverity: req.damageSeverity,
                reliefAmount: req.reliefAmount ? req.reliefAmount.toString() : '0.00',
                status: req.status.toUpperCase(),
                bankName: req.bankName || 'N/A',
                branchName: req.branchName || 'N/A',
                accountHolder: req.accountHolder || 'N/A',
                accountNumber: req.accountNumber || 'N/A',
                accountNic: req.accountNic || 'N/A',
                remarks: req.remarks || '',
                enumerator: req.enumerator ? req.enumerator.username : 'System',
                enumeratorId: req.enumerator ? req.enumerator.id : 'N/A',
                actioner: req.actioner ? req.actioner.username : 'Pending',
                assignedVolunteer: req.assignedVolunteer ? req.assignedVolunteer.username : 'Unassigned',
                createdAt: req.createdAt
            });
        });

        
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=relief_requests_full_audit.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        logger.error("Excel Generation Error: " + error.message);
        res.status(500).json({ message: "Failed to generate Excel report" });
    }
};


exports.generateReliefPdf = async (req, res) => {
    try {
        let whereClause = {};

        
        if (req.user.role === 'District Officer') {
            whereClause.district = req.user.district;
        } else if (req.user.role === 'Division Officer') {
            whereClause.dsDivision = req.user.dsDivision;
        }

        const requests = await db.ReliefRequest.findAll({
            where: whereClause,
            include: [
                { model: db.User, as: 'enumerator', attributes: ['username', 'id'] },
                { model: db.User, as: 'assignedVolunteer', attributes: ['username'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        
        const doc = new PDFDocument({ margin: 20, size: 'A4', layout: 'landscape' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=relief_requests_snapshot.pdf');

        doc.pipe(res);

        doc.fontSize(18).text('Official Relief Requests Detailed Report', { align: 'center' });
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown();

        
        const table1 = {
            title: "Part 1: Location & Identity Details",
            headers: ["ID", "GN Div", "DS Div", "GN ID", "Household ID", "Census Block", "Census Unit", "Entered By", "Enum ID"],
            rows: requests.map(r => [
                r.id ? r.id.toString() : 'N/A',
                r.gnDivision || 'N/A',
                r.dsDivision || 'N/A',
                r.gnId || 'N/A',
                r.householdId || 'N/A',
                r.censusBlock || 'N/A',
                r.censusUnit || 'N/A',
                r.enumerator ? r.enumerator.username : 'System',
                r.enumerator ? r.enumerator.id.toString() : 'N/A'
            ])
        };

        await doc.table(table1, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(7),
            prepareRow: () => doc.font("Helvetica").fontSize(7),
            width: 800 
        });

        doc.moveDown();

       
        const table2 = {
            title: "Part 2: Incident, Financial & Status Details",
            headers: ["ID", "Incident", "Date", "Severity", "Amount", "Status", "Bank", "Account", "Volunteer"],
            rows: requests.map(r => [
                r.id ? r.id.toString() : 'N/A', // Repeated ID for reference
                r.incidentType || 'N/A',
                r.incidentDate || 'N/A',
                r.damageSeverity || 'N/A',
                r.reliefAmount ? r.reliefAmount.toString() : '0.00',
                r.status.toUpperCase() || 'N/A',
                r.bankName || 'N/A',
                r.accountNumber || 'N/A',
                r.assignedVolunteer ? r.assignedVolunteer.username : '-'
            ])
        };

        await doc.table(table2, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(7),
            prepareRow: () => doc.font("Helvetica").fontSize(7),
            width: 800
        });

        doc.end();
    } catch (error) {
        logger.error("PDF Generation Error: " + error.message);
        res.status(500).json({ message: "Failed to generate PDF report" });
    }
};

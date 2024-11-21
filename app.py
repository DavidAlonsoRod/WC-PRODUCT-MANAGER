
from flask import Flask, render_template, request, make_response
import xml.etree.ElementTree as ET

app = Flask(__name__)

@app.route('/')
def form():
    return render_template('form.html')

@app.route('/generate_xml', methods=['POST'])
def generate_xml():
    nombre = request.form['nombre']
    numero_cuenta = request.form['numero_cuenta']
    cantidad = request.form['cantidad']

    root = ET.Element("Document", xmlns="urn:iso:std:iso:20022:tech:xsd:pain.008.001.02")
    cstmrDrctDbtInitn = ET.SubElement(root, "CstmrDrctDbtInitn")
    pmtInf = ET.SubElement(cstmrDrctDbtInitn, "PmtInf")
    drctDbtTxInf = ET.SubElement(pmtInf, "DrctDbtTxInf")
    
    dbtr = ET.SubElement(drctDbtTxInf, "Dbtr")
    dbtr_nombre = ET.SubElement(dbtr, "Nm")
    dbtr_nombre.text = nombre
    
    dbtrAcct = ET.SubElement(drctDbtTxInf, "DbtrAcct")
    id = ET.SubElement(dbtrAcct, "Id")
    iban = ET.SubElement(id, "IBAN")
    iban.text = numero_cuenta
    
    instdAmt = ET.SubElement(drctDbtTxInf, "InstdAmt", Ccy="EUR")
    instdAmt.text = cantidad

    tree = ET.ElementTree(root)
    xml_data = ET.tostring(root, encoding='utf8', method='xml')
    
    response = make_response(xml_data)
    response.headers['Content-Type'] = 'application/xml'
    response.headers['Content-Disposition'] = 'attachment; filename=remesa.xml'
    return response

if __name__ == '__main__':
    app.run(debug=True)
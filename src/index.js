import PdfObject from './pdf-object.js'

(function pdfObjectConfigLoader () {
  const pdfInstances = document.querySelectorAll('[data-pdf-object-id]')
  pdfInstances.forEach((inst) => {
    const src = inst.getAttribute('data-url')
    let conf = {
      targetNode: inst,
      url: src
    }
    new PdfObject(conf)
  })
})()

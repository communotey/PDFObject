import PdfObject from './pdf-object.js'

(function pdfObjectConfigLoader () {
  const pdfInstances = document.querySelector('[data-pdf-object-id]')
  pdfInstances.forEach((inst) => {
    const src = inst.getAttribute('data-src')
    let conf = {
      url: src
    }
    PdfObject(conf)
  })
})()

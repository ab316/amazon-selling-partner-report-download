# amazon-selling-partner-report-download
Downloads and decrypts an Amazon Selling Partner report. It uses the response from the [getReportDocument](https://developer-docs.amazon.com/sp-api/docs/reports-api-v2020-09-01-reference#get-reports2020-09-04documentsreportdocumentid) operation to donwload the report

This is a quick and dirty utility but it does the job.

1. Populate the `response.json`. The contents of this file should actually come from the selling partner API and can be simply pasted in it
1. Run npm start
1. The decrypted file will be generated as `decrypted`
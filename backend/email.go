package main

import (
	"bytes"
	"html/template"
)

const emailTemplate = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f5f6f2;color:#20231f;font-family:Arial,Helvetica,sans-serif"><div style="display:none;max-height:0;overflow:hidden">{{.Preview}}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f6f2"><tr><td align="center" style="padding:32px 12px"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:20px"><tr><td style="padding:32px 32px 26px;border-bottom:1px solid #e2e6dc"><a href="https://www.inceptchange.com" style="color:#20231f;text-decoration:none;font-size:25px;font-weight:bold">Incept<span style="font-weight:normal">Change</span></a><p style="margin:8px 0 0;font-size:9px;letter-spacing:2px;color:#73796e">CREATIVE DIGITAL STUDIO</p></td></tr><tr><td style="padding:32px"><p style="margin:0 0 18px;color:#367b73;font-size:10px;letter-spacing:2px">{{.Eyebrow}}</p><h1 style="margin:0;font-size:38px;line-height:1.15;font-weight:normal;letter-spacing:-1px">{{.Heading}}<br><em style="font-family:Georgia,serif;color:#367b73">{{.Accent}}</em></h1><p style="margin:24px 0;font-size:14px;line-height:1.8;color:#687061">{{.Intro}}</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f6f2;border-radius:12px"><tr><td style="padding:22px"><p style="margin:0 0 18px;font-size:11px;letter-spacing:1px;color:#367b73">YOUR CREATIVE BRIEF</p><table width="100%" cellspacing="0" cellpadding="0">{{range .Rows}}<tr><th align="left" valign="top" style="padding:12px 12px 12px 0;border-bottom:1px solid #e2e6dc;width:105px;font-size:11px;font-weight:normal;color:#73796e">{{.Label}}</th><td valign="top" style="padding:12px 0;border-bottom:1px solid #e2e6dc;font-size:13px;line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word">{{.Value}}</td></tr>{{end}}</table></td></tr></table><p style="margin:24px 0;font-size:13px;color:#687061;line-height:1.8">{{.Next}}</p><table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="background:#20251f;border-radius:7px;padding:15px 22px"><a href="{{.Link}}" style="font-size:13px;color:#d5e79e;text-decoration:none">{{.CTA}} ↗</a></td></tr></table><p style="margin:26px 0 0;font-size:11px;line-height:1.8;color:#73796e">This is an enquiry, not a confirmed booking. Our team will confirm availability and details with you.</p></td></tr><tr><td style="padding:26px 32px;background:#e4f2f0;border-radius:0 0 20px 20px"><p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:24px">Stories worth making.</p><p style="margin:14px 0 0;font-size:11px;color:#465042;line-height:1.8"><a href="mailto:inceptchange@gmail.com" style="color:#367b73">inceptchange@gmail.com</a> · <a href="tel:+94787773059" style="color:#367b73">+94 78 777 3059</a><br>Sri Lanka · Photography, film &amp; creative stories</p></td></tr></table></td></tr></table></body></html>`

type emailRow struct{ Label, Value string }
type emailContent struct {
	Preview, Eyebrow, Heading, Accent, Intro, Next, Link, CTA string
	Rows                                                      []emailRow
}

var brandedEmail = template.Must(template.New("enquiry").Parse(emailTemplate))

func renderEmail(b Brief, customer bool) (string, error) {
	content := emailContent{Preview: "A new creative story is ready for your review.", Eyebrow: "A NEW STORY STARTS HERE", Heading: "A new idea,", Accent: "ready to capture.", Intro: "A customer has shared their vision. Here is the complete brief to help you start the conversation.", Next: "Review the details and reply to the customer to discuss availability and the next steps.", Link: "https://www.inceptchange.com/admin", CTA: "Open studio admin"}
	if customer {
		content.Preview = "Your creative brief has reached InceptChange."
		content.Eyebrow = "THANK YOU FOR SHARING YOUR STORY"
		content.Heading = "Your story is"
		content.Accent = "in good hands."
		content.Intro = "Hi " + b.Name + ", thanks for reaching out. We’ve received your enquiry, and here is a copy of everything you shared."
		content.Next = "Our team will contact you soon to talk through your idea. For any updates, reply to this email and we’ll take it from there."
		content.Link = "https://www.inceptchange.com/works"
		content.CTA = "Explore our stories"
	}
	touches := b.Touches
	if touches == "" {
		touches = "Leave it to the team"
	}
	content.Rows = []emailRow{{"Service / idea", b.Service}, {"Date", b.Date}, {"Location", b.Location}, {"Time", b.Time}, {"Final touches", touches}, {"Name", b.Name}, {"Email", b.Email}}
	var output bytes.Buffer
	err := brandedEmail.Execute(&output, content)
	return output.String(), err
}

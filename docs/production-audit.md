{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue0;\red38\green38\blue38;\red91\green91\blue91;
\red75\green75\blue75;}
{\*\expandedcolortbl;;\cspthree\c0\c0\c0;\cspthree\c20000\c20000\c20000;\cspthree\c43137\c43137\c43137;
\cspthree\c36471\c36471\c36471;}
\margl1440\margr1440\vieww14460\viewh15700\viewkind0
\pard\tx560\tx1120\tx1680\tx2240\tx2800\tx3360\tx3920\tx4480\tx5040\tx5600\tx6160\tx6720\pardirnatural\partightenfactor0

\f0\fs36 \cf2 Tiny Explorers Nursery & Preschool \'96 Production\
QA Audit\

\fs27 Overview\

\fs18 This audit evaluates the live Tiny Explorers Nursery & Preschool website\
( tinyexplorersv3.vercel.app ) from the perspectives of quality assurance, frontend development,\
user experience, accessibility and SEO. Every major page and interaction available to a real visitor was\
assessed. Findings are organized by severity with concrete recommendations for remediation. All\
observations are based on the state of the site accessed from Bermuda on 5 July 2026.\

\fs27 General Observations\

\fs18 \'95\
\'95\
\'95\
\'95\
Navigation and content structure \'96 The site uses a sticky top navigation with links for Programs,\
About (dropdown), Experiences (dropdown), Parents, phone number and a Book a Visit\
call\uc0\u8209 to\u8209 action. A hero section introduces the school with a tagline and CTA. The home page contains\
sections for programs, philosophy, experiences, gallery, parent information, newsletter and footer.\
The overall information architecture is logical, but there are no dedicated pages for the individual\
programs (Infant Care, Toddler Program, etc.), so deeper information is missing.\
Client\uc0\u8209 side routing \'96 Pages are built with client\u8209 side React routing. Many pages contain only a\
skeleton in the HTML source; all content loads via JavaScript, which fails for several routes. For\
example, the Environment, Educators and Careers routes load completely blank screens and\

\fs12 \cf3 1 2\

\fs18 \cf2 require a refresh to recover; this is reproducible and constitutes a launch\uc0\u8209 blocking bug .\
Additionally, the home page sometimes loads blank until the visitor refreshes.\
Forms and CTAs \'96 Multiple CTAs (Start enrollment, Book a visit, Schedule a wellness tour,\
Begin admissions) all open the same generic \'93Start an enrollment inquiry\'94 modal form. Submitting\
the form with valid data returns an error \'93Could not submit. Please try again\'94, indicating the backend\
is not wired up 
\fs12 \cf3 3\

\fs18 \cf2 . The newsletter subscription form also fails to submit. A mailto: link on the\

\fs12 \cf3 4\

\fs18 \cf2 Adventures page triggers a blocked protocol error .\
\'95 
\fs12 \cf3 5\

\fs18 \cf2 Accessibility \'96 Focus states are visible (orange rings) during keyboard navigation and the header\
remains sticky on scroll. However, many images used on program cards, gallery and section\
backgrounds have no discernible alternative text, and there is no skip link for keyboard users. The\
heading hierarchy is inconsistent; for example, the hero tagline uses body\uc0\u8209 style text while H1 may be\
reused later on the page. The modal close icon is small and lacks a clear accessible name; modals do\
not trap focus. Colour contrast appears adequate for large text but may fail for smaller grey text.\
SEO and metadata \'96 The HTML head includes meta description and keywords, Open Graph tags and\
structured data for a Preschool schema. However, the canonical URL across all pages points to\
https://tinyexplorers.bm/ , which currently returns a 502 error and does not match the live\
domain 
\fs12 \cf3 6\

\fs18 \cf2 . The robots.txt file is present and allows all agents, but the sitemap URL points to\
https://tinyexplorers.bm/sitemap.xml , which returns a 502 error 
\fs12 \cf3 7\

\fs18 \cf2 . Consequently search\
engines will not crawl the correct site. Page titles are not unique (every route shares the same title)\
\cf4 1
\fs24 \cf0 \page 
\fs18 \cf2 \'95\
and there are duplicate H1 headings across pages. Internal linking is mostly via anchor links, leaving\
deep pages undiscoverable.\
Performance and responsive design \'96 The site uses high\uc0\u8209 resolution images from Unsplash and\
Pexels but does not implement lazy loading or srcset . There is no visible performance indicator,\
and some hero images cause large layout shifts. Responsiveness appears adequate up to large\
tablet sizes; however, the complex gallery mosaic and some forms may not scale to 320 px without\
overflow. The site does not expose a mobile navigation (the desktop nav compresses but there is no\
hamburger menu), which could create usability issues on small screens.\

\fs27 Detailed Issues & Recommendations\

\fs18 Severity Location Problem Why it matters Recommendation Confiden\
Critical\
/\
environment , /\
educators , /\
careers\
routes\
Visiting these routes\
results in a\
completely blank\
page; sometimes\
even the home page\
becomes blank until\

\fs12 \cf3 1 2\

\fs18 \cf2 refreshed .\
Users cannot\
access key\
content\
(Environment\
details, Educator\
profiles, Careers\
information).\
This destroys\
trust and\
prevents\
exploration.\
Investigate the client\uc0\u8209 side router.\
Ensure these routes properly\
return components and do not\
crash during hydration. Add error\
boundaries and server\uc0\u8209 side\
fallbacks so that content renders\
even if JS fails.\
High\
Critical\
\'93Start\
enrollment\'94\
modal form\
(triggered from\
multiple CTAs)\
Form submission\
fails with generic\
error \'93Could not\
submit\'94 despite valid\

\fs12 \cf3 3\

\fs18 \cf2 inputs . Form also\
lacks dedicated\
success message or\
backend integration.\
Users cannot\
submit\
enrollment\
inquiries or book\
tours, effectively\
blocking\
admissions.\
Connect the form to a working\
backend or service (e\uc0\u8209 mail, CRM).\
Provide client\uc0\u8209 side and server\u8209 side\
validation and clear success/\
failure messages.\
High\
High\
Wellness &\
Care page \'96\
accordion\
Accordion allows\
multiple items to\
remain open\
simultaneously and\
does not manage\
focus or ARIA\

\fs12 \cf3 8\

\fs18 \cf2 attributes .\
Screen\uc0\u8209 reader\
users may not\
know which\
section is\
expanded;\
multiple open\
panels create\
confusion.\
Use <button> elements with\
aria-expanded and aria-\
controls on headings. Ensure\
only one accordion panel is open\
at a time (if intended) and update\
focus appropriately.\
Medium\
\cf4 2
\fs24 \cf0 \page 
\fs18 \cf2 Severity Location Problem Why it matters Recommendation Confiden\
High Gallery mosaic\
( #gallery )\
Images are\
decorative but use\
buttons without ARIA\
labels; clicking\
arrows toggles\
caption overlays but\
lacks accessible text\

\fs12 \cf3 9\

\fs18 \cf2 .\
Non\uc0\u8209 sighted\
users cannot\
determine\
content; arrow\
buttons are not\
labelled, so\
screen\uc0\u8209 reader\
users cannot\
control the\
gallery.\
Provide alt text for each photo;\
label the toggling buttons (e.g.,\
\'93Show caption for Afternoon\
Hush\'94). Consider a modal/lightbox\
for larger view and caption.\
Medium\
High\
mailto: link\
on Adventures\
page\
\'93Tell us about your\
idea\'94 opens\
mailto: link which\
is blocked in some\
environments and\
fails with an error\

\fs12 \cf3 4\

\fs18 \cf2 .\
Users may not\
have a\
configured mail\
client; blocked\
protocols harm\
user experience.\
Replace with an internal contact\
form or a simple \'93Copy e\uc0\u8209 mail\
address\'94 function. Provide a\
fallback contact method.\
High\
High Program cards\
(\'93Learn more\'94)\
The \'93Learn more\'94\
arrows on program\
cards do not navigate\
to any page. There\
are no dedicated\
program detail pages\

\fs12 \cf3 10\

\fs18 \cf2 .\
Prospective\
parents cannot\
get detailed\
curricula or daily\
schedules for\
each age group,\
weakening the\
admissions\
funnel.\
Create separate pages or\
expanders for each program,\
detailing curriculum, teacher\
ratios, photos and parent\
testimonials. Make the arrows\
focusable with descriptive aria-\
labels .\
Medium\
High\
Broken\
canonical and\
sitemap\
Each page\'92s <link\
rel="canonical">\
refers to https://\
tinyexplorers.bm/,\
a different domain\
returning a 502 error\

\fs12 \cf3 6\

\fs18 \cf2 . Robots.txt\
points to a sitemap\
on the same\
non\uc0\u8209 functional\

\fs12 \cf3 7\

\fs18 \cf2 domain .\
Search engines\
cannot index the\
live site;\
canonical\
misconfiguration\
may cause\
duplicate\
content issues.\
Update the canonical tags to point\
to the correct domain (e.g.,\
https://\
tinyexplorersv3.vercel.app/\
or the final production domain).\
Host a valid sitemap and update\
robots.txt accordingly.\
Medium\
\cf4 3
\fs24 \cf0 \page 
\fs18 \cf2 Severity Location Problem Why it matters Recommendation Confiden\
Medium\
Navigation &\
mobile\
usability\
There is no dedicated\
mobile nav\
(hamburger) at\
widths < 768 px; links\
compress and may\
wrap. The sticky\
header may obscure\
page anchors.\
On small screens\
the header items\
may become\
unreadable or\
overlap,\
harming\
usability.\
Implement a responsive\
hamburger menu for 320\'96375 px\
widths. Ensure anchor links offset\
scroll positions to account for\
sticky header height.\
Low\
Medium Modal\
accessibility\
Enrollment inquiry\
modal can be opened\
by pressing any CTA.\
It lacks a focus trap, a\
clearly labelled close\
button, and an\
explicit heading;\
pressing escape does\
close the modal but\
not indicated.\
Without focus\
trap, keyboard\
users can tab\
into the\
background\
page while the\
modal is open.\
Screen\uc0\u8209 reader\
users may not\
know they are\
inside a modal.\
Add aria-modal="true" ,\
role="dialog" with a\
descriptive heading, trap focus\
within the modal, and ensure the\
close button has an accessible\
label (e.g., \'93Close enrollment\
form\'94).\
Medium\
Medium Newsletter\
form\
Email input requires\
an address but\
submission fails;\
there is no success\
message or backend\

\fs12 \cf3 11\

\fs18 \cf2 integration .\
Users cannot\
sign up for\
updates, causing\
lost\
engagement.\
Connect form to an email\
marketing service or serverless\
function; display success/error\
toasts.\
Medium\
Medium FAQ & Policies\
pages\
The FAQ and policy\
accordions allow\
multiple open panels\
and have\
inconsistent heading\
levels; some policies\
have long\
paragraphs without\
anchors. The\
downloadable policy\
file is named\
index.html with\

\fs12 \cf3 12\

\fs18 \cf2 generic content .\
Inaccessible\
heading\
hierarchy makes\
it difficult for\
assistive\
technologies to\
navigate;\
ambiguous\
downloads may\
confuse parents.\
Use proper heading levels ( h2 ,\
h3 ) and unique id anchors for\
each policy. Rename\
downloadable files to descriptive\
names (e.g.,\
Enrollment_Policy.pdf ).\
Medium\
\cf4 4
\fs24 \cf0 \page 
\fs18 \cf2 Severity Location Problem Why it matters Recommendation Confiden\
Medium Focus and skip\
navigation\
There is a visible\
focus ring, but no\
skip\uc0\u8209 to\u8209 content link.\
The sticky header\
lacks\
role="banner" or\
nav semantics.\
Keyboard and\
screen\uc0\u8209 reader\
users must tab\
through\
navigation on\
every page load.\
Add a \'93Skip to main content\'94 link\
that appears on focus. Use\
semantic roles ( <header> ,\
<nav> , <main> , <footer> )\
and label navigation sections.\
Medium\
Medium Colour contrast\
& typography\
Some grey text (e.g.,\
captions, footers)\
may not meet WCAG\
AA contrast against\
the beige\
background. Font\
sizes vary widely,\
making it hard to\
distinguish heading\
levels.\
Users with low\
vision or colour\
blindness may\
struggle to read\
content.\
Test all text for contrast ratio\
using tools. Increase contrast and\
unify typography scales; ensure\
headings are visually distinct and\
semantically consistent.\
Low\
Low Performance\
The site loads large,\
high\uc0\u8209 resolution\
images without\
loading="lazy"\
or srcset . There is\
no caching of fonts\
or images; hero\
images cause layout\
shifts.\
Slow loading\
harms user\
experience and\
SEO; layout\
shifts can\
frustrate users.\
Optimize images with appropriate\
sizes and formats (WebP/AVIF),\
implement lazy loading, and\
define explicit width/height to\
prevent layout shift. Use caching\
headers for static assets.\
Medium\
Low\
Social sharing\
& meta\
diversity\
All pages share the\
same meta\
description and\
Open Graph data; no\
unique titles or\
descriptions for\
individual routes.\
When sharing\
specific pages\
(e.g., Wellness),\
social previews\
will be generic\
and less\
engaging.\
Provide unique <title> ,\
<meta name="description">\
and Open Graph tags for each\
page.\
Medium\
\cf4 5
\fs24 \cf0 \page 
\fs18 \cf2 Severity Location Problem Why it matters Recommendation Confiden\
Low\
Minor UI\
consistency\
Buttons vary in\
padding,\
capitalization and\
shadows across\
sections; some CTAs\
are duplicated\
(Book a tour vs. Start\
enrollment).\
Testimonials or\
parent quotes are\
missing.\
Inconsistent UI\
erodes\
professionalism\
and user trust.\
Establish a consistent design\
system for buttons, cards and\
typography. Audit CTA copy and\
use unique wording for distinct\
actions (e.g., \'93Schedule a tour\'94 vs.\
\'93Apply now\'94).\
Medium\

\fs27 Launch Blockers\

\fs18 1.\
2.\
3.\
Fix blank pages \'96 Ensure that the Environment, Educators and Careers pages render correctly and\

\fs12 \cf3 1\

\fs18 \cf2 do not cause the entire app to display a blank screen .\
Functional forms \'96 The enrollment inquiry and newsletter forms must submit successfully and\

\fs12 \cf3 3\

\fs18 \cf2 display confirmation messages .\
Program information \'96 Provide detailed program pages or sections so parents can learn about\

\fs12 \cf3 10\

\fs18 \cf2 each age group; remove or fix the non\uc0\u8209 functional \'93Learn more\'94 arrows .\

\fs27 High\uc0\u8209 Priority Fixes\

\fs18 \'95 
\fs12 \cf3 7\

\fs18 \cf2 Correct canonical URLs, sitemap URL and robots.txt to point at the actual production domain .\
\'95 
\fs12 \cf3 4\

\fs18 \cf2 Replace mailto: links with accessible contact forms or copy\uc0\u8209 to\u8209 clipboard interactions .\
\'95\
\'95\
\'95\
\'95\
Improve accessibility: provide alt text for all images, add skip navigation links, use proper headings\
and ARIA semantics, and trap focus within modals.\
Implement mobile navigation and ensure navigation anchors account for the sticky header.\
Create descriptive, unique titles and meta descriptions for each route.\
Ensure the accordion components meet ARIA guidelines.\

\fs27 Medium\uc0\u8209 Priority Improvements\

\fs18 \'95\
\'95\
\'95\
\'95\
\'95\
Optimize images and enable lazy loading and responsive images to improve performance.\
Verify colour contrast and adjust text colours and sizes to meet WCAG 2.1 AA.\
Enhance content: include testimonials, teacher bios, and program curriculum details. Add a\
dedicated contact page with map, phone, and e\uc0\u8209 mail.\
Provide clear CTAs that map to different outcomes (tour booking vs. admissions vs. general inquiry)\
and connect them to appropriate forms.\
Use descriptive file names and accessible downloads for policies and forms.\

\fs27 Minor Polish\

\fs18 \'95\
\'95\
Standardize button styles, shadows and hover effects across the site.\
Adjust spacing and alignment inconsistencies in cards and sections.\
\cf4 6
\fs24 \cf0 \page 
\fs18 \cf2 \'95\
\'95\
Add subtle micro\uc0\u8209 animations for card hover states but ensure they do not distract or hinder\
accessibility.\
Provide alt attributes for decorative images either empty ( alt="" ) or descriptive if informative.\

\fs27 Overall Production Readiness Score\

\fs18 55 / 100 \'96 The site has an attractive design and a clear mission, but critical functional and accessibility issues\
prevent a production launch. Blank pages, non\uc0\u8209 functional forms and confusing canonical/sitemap\
configuration must be resolved. Once these blockers are addressed and the recommended improvements\
are implemented, the site will be ready for paying parents and professional audits.\

\fs12 \cf3 1 6\

\fs18 \cf2 Tiny Explorers \'97 Bermuda Early Childhood Center | Hamilton\

\fs15 \cf5 https://tinyexplorersv3.vercel.app/educators\

\fs12 \cf3 2\

\fs18 \cf2 Tiny Explorers \'97 Bermuda Early Childhood Center | Hamilton\

\fs15 \cf5 https://tinyexplorersv3.vercel.app/environment\

\fs12 \cf3 3\

\fs18 \cf2 Tiny Explorers \'97 Bermuda Early Childhood Center | Hamilton\

\fs15 \cf5 https://tinyexplorersv3.vercel.app/adventures\

\fs12 \cf3 4\

\fs18 \cf2 Tiny Explorers \'97 Bermuda Early Childhood Center | Hamilton\

\fs15 \cf5 mailto:hello%40tinyexplorers.bm\

\fs12 \cf3 5\

\fs18 \cf2 Tiny Explorers \'97 Bermuda Early Childhood Center | Hamilton\

\fs15 \cf5 https://tinyexplorersv3.vercel.app/\

\fs12 \cf3 7\

\fs18 \cf2 tinyexplorersv3.vercel.app\

\fs15 \cf5 https://tinyexplorersv3.vercel.app/robots.txt\

\fs12 \cf3 8\

\fs18 \cf2 Tiny Explorers \'97 Bermuda Early Childhood Center | Hamilton\

\fs15 \cf5 https://tinyexplorersv3.vercel.app/wellness\

\fs12 \cf3 9\

\fs18 \cf2 Tiny Explorers \'97 Bermuda Early Childhood Center | Hamilton\

\fs15 \cf5 https://tinyexplorersv3.vercel.app/%23gallery\

\fs12 \cf3 10\

\fs18 \cf2 Tiny Explorers \'97 Bermuda Early Childhood Center | Hamilton\

\fs15 \cf5 https://tinyexplorersv3.vercel.app/%23programs\

\fs12 \cf3 11\

\fs18 \cf2 Tiny Explorers \'97 Bermuda Early Childhood Center | Hamilton\

\fs15 \cf5 https://tinyexplorersv3.vercel.app/philosophy\

\fs12 \cf3 12\

\fs18 \cf2 Tiny Explorers \'97 Bermuda Early Childhood Center | Hamilton\

\fs15 \cf5 https://tinyexplorersv3.vercel.app/policies/enrollment-policy\

\fs18 \cf4 7}
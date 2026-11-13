# Leads CRM + WhatsApp bot: setup

The CRM is in **kashigo.in/admin → Leads** (it's the first tab). The WhatsApp bot lets the team add and update leads from their phones. Every website service enquiry (`/api/enquiry`) also shows up there as a lead automatically.

## 1. Create the table (one time)
Supabase → SQL editor → paste and run `supabase/leads.sql`.

## 2. Create the WhatsApp bot number (Meta WhatsApp Cloud API, free)
1. Go to developers.facebook.com, then **My Apps → Create app → Business**. Add the **WhatsApp** product.
2. **WhatsApp → API Setup** gives you a free **test number**. It can message up to 5 phone numbers you verify there, which is enough for the team. Add each team phone under "To". For a permanent number of your own, add a fresh SIM that isn't already on WhatsApp.
3. Copy the **Phone number ID** from the same page.
4. Get a **permanent token**: business.facebook.com → Settings → Users → **System users** → Add (Admin) → **Generate token** for your app with `whatsapp_business_messaging` and `whatsapp_business_management`. Also assign the app and the WhatsApp account to that system user.
5. Get the **App secret**: App settings → Basic → App secret → Show.

## 3. Add these in Vercel → Settings → Environment Variables
| Name | Value |
|---|---|
| `WHATSAPP_TOKEN` | the permanent token |
| `WHATSAPP_PHONE_NUMBER_ID` | the phone number ID |
| `WHATSAPP_APP_SECRET` | the app secret |
| `WHATSAPP_VERIFY_TOKEN` | any long random word you make up |
| `WHATSAPP_ALLOWED_NUMBERS` | the team's phones, comma-separated, e.g. `918175966910, 919876543210`. Nobody else gets a reply. |
| `NEXT_PUBLIC_GOOGLE_REVIEW_URL` | *(optional)* your Google "Ask for reviews" link, used in the review message |

Then redeploy.

## 4. Connect the webhook
Meta app → **WhatsApp → Configuration → Webhook → Edit**:
- Callback URL: `https://kashigo.in/api/whatsapp`
- Verify token: the same `WHATSAPP_VERIFY_TOKEN`
- Then **Manage → subscribe to `messages`**.

## 5. Use it
Save the bot number on each team phone and send **help**.

| Send | What happens |
|---|---|
| `Rahul 98765 43210 evening aarti 4 people 20 Dec, called` | New lead. The bot finds the name, number, ride, people, date and source (call / insta / website). |
| a shared **contact card** | New lead |
| a forwarded enquiry message that has a number in it | New lead |
| reply **booked** / **quoted 4500** / **lost** / **follow up** to the bot's message about a lead | Status updated |
| tap **Update** on the bot's message | Pick a status or get a client message |
| `23 booked`, `23 note no answer`, `23 date 22 Dec`, `23 pax 6`, `23 ₹5200` | Updates lead #23 |
| `23 msg` / `23 msg hindi` | A ready-to-forward message for that client, plus a link that opens their chat with it already typed |
| `list` | Today's numbers and who needs a follow-up |
| `find rahul` | Search |

The same number never creates a duplicate lead. A repeat enquiry is added to the open lead. Changing a status sets the next follow-up date by itself: Contacted +1 day, Quoted +2, Follow-up +2. Booked or Lost clears it.

Cost: the bot only replies inside chats the team starts. Meta doesn't charge for those service conversations.

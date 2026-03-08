import fs from 'fs';
import path from 'path';

export const getBookingEmailTemplate = async (data: any, rideId: string) => {
    const paymentModeText = data.paymentMode === 'cod' ? 'Cash on Delivery' : 'Online';

    try {
        // Read the HTML file statically relative to the project root
        // process.cwd() is reliable in Next.js Server Components / API routes
        const templatePath = path.join(process.cwd(), 'email-preview.html');
        let htmlContent = fs.readFileSync(templatePath, 'utf8');

        // Replace the placeholders with actual data
        htmlContent = htmlContent.replace('{{PASSENGER_NAME}}', data.passengerDetails?.name || 'Customer');
        htmlContent = htmlContent.replace('{{RIDE_ID}}', rideId);
        htmlContent = htmlContent.replace('{{GHAT}}', data.ghat || '');
        htmlContent = htmlContent.replace('{{TIME_OF_DAY}}', data.timeOfDay || '');
        htmlContent = htmlContent.replace('{{BOAT_TYPE}}', data.boatType || '');
        htmlContent = htmlContent.replace('{{PASSENGERS_COUNT}}', data.passengerDetails?.passengersCount || '1');
        htmlContent = htmlContent.replace('{{AMOUNT}}', data.amount || '0');
        htmlContent = htmlContent.replace('{{PAYMENT_MODE}}', paymentModeText);

        return htmlContent;
    } catch (error) {
        console.error("Failed to read email template file:", error);
        throw new Error("Could not process email template");
    }
};

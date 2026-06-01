const fs = require('fs');
const p = 'c:/Users/ajode/Downloads/Campus Crush/server/services/email.service.ts';
const t = fs.readFileSync(p, 'utf8');

const bad = t.indexOf('          </h1>');
const good = t.indexOf('// VERIFY OTP');

if (bad === -1) { console.log('Orphaned HTML not found — already clean?'); process.exit(0); }
if (good === -1) { console.error('Could not find // VERIFY OTP marker'); process.exit(1); }

const replacement = `
    console.log('OTP sent successfully');
    console.log('OTP sent to: ' + email);

    return { success: true, message: 'OTP sent successfully' };

  } catch (error) {
    console.error('OTP send error:', error);
    console.error('OTP email failed:', error?.message || error);
    const reason = error?.responseCode
      ? ('SMTP error ' + error.responseCode + ': ' + error.response)
      : (error?.message || 'Unknown email error');
    throw new Error(reason);
  }
};


`;

const fixed = t.slice(0, bad) + replacement + t.slice(good);
fs.writeFileSync(p, fixed, 'utf8');
console.log('DONE, length=' + fixed.length);

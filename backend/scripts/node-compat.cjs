const os = require('node:os');

try {
  os.userInfo();
} catch {
  // Algunos entornos Windows administrados no exponen el perfil al proceso Node.
  os.userInfo = () => ({
    uid: -1,
    gid: -1,
    username: process.env.USERNAME || 'ecopunto',
    homedir: process.env.USERPROFILE || os.tmpdir(),
    shell: null,
  });
}

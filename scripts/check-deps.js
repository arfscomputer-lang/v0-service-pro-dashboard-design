const { execSync } = require("child_process")

console.log("Node version:", process.version)

try {
  const result = execSync("pnpm install --no-frozen-lockfile 2>&1", { 
    encoding: "utf8",
    cwd: "/vercel/share/v0-project",
    timeout: 120000
  })
  console.log("OUTPUT:", result)
} catch (e) {
  console.log("ERROR:", e.message?.substring(0, 500))
  console.log("STDOUT:", e.stdout?.substring(0, 2000))
  console.log("STDERR:", e.stderr?.substring(0, 2000))
}

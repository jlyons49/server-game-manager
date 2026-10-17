/**
 * Corporate notification toasts (Slack/Teams style) with satirical AI and management comments.
 * Context-aware: delivers hilarious quotes specifically tailored to the minigame just played!
 */
export class ToastManager {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.style.position = 'fixed';
    this.container.style.bottom = '16px';
    this.container.style.right = '12px';
    this.container.style.left = 'auto';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.gap = '10px';
    this.container.style.zIndex = '9000';
    this.container.style.pointerEvents = 'none';
    this.container.style.width = 'min(360px, calc(100vw - 24px))';
    document.body.appendChild(this.container);

    // Minigame-specific satirical quote pools
    this.moduleQuotes = {
      AutonomousCar: {
        wins: [
          { sender: 'Algorithm 9.4', role: 'Autonomous Driver', text: 'Mammal collision averted! Pedestrian liability deferred to next fiscal quarter.' },
          { sender: 'Duck Rights Legal Team', role: 'Avian Ethics Board', text: 'Quack! The waterfowl community acknowledges your prompt evasive maneuver.' },
          { sender: 'Vehicle Firmware v12', role: 'Over-The-Air Telemetry', text: 'Airbag deployment suppressed. Polyurethane foam barrier absorbed optimal kinetic inertia.' },
          { sender: 'VP of Transportation', role: 'Fleet Management', text: 'Zero blood on the bumper means zero emergency PR press conferences today!' },
          { sender: 'Traffic Sensor Bot', role: 'Smart City Mesh', text: 'Lane departure violation waived due to exemplary emergency swerve metrics.' }
        ],
        losses: [
          { sender: 'Algorithm 9.4', role: 'Autonomous Driver', text: 'Optical sensor confused wildlife with decorative puddle. Catastrophic feather dispersion.' },
          { sender: 'Avian Ethics Board', role: 'Legal Injunction', text: 'A formal cease-and-desist has been filed on behalf of local mallards.' },
          { sender: 'Autonomous Fleet Insurance', role: 'Underwriting Bot', text: 'Policy deductible increased by 400% due to unprovoked animal contact.' },
          { sender: 'PR Crisis Drone', role: 'Brand Damage Control', text: 'Drafting 4-page heartfelt LinkedIn apology to the local ecosystem.' },
          { sender: 'Highway Patrol AI', role: 'Citation Automation', text: 'Reckless navigation recorded! Traffic ticket billed directly to your paycheck.' }
        ]
      },

      AutonomousCruise: {
        wins: [
          { sender: 'RMS Gigantic AI', role: 'Autonomous Helm', text: 'Iceberg successfully reclassified as "decorative background scenery".' },
          { sender: 'First Mate Bot', role: 'Bridge Telemetry', text: 'Full rudder deflection recorded! Champagne towers in the ballroom remained upright.' },
          { sender: 'Luxury Cruise Concierge', role: 'Guest Experience', text: 'First-class passengers praised the sudden sharp turn as an "immersive open-sea thrill ride".' },
          { sender: 'Maritime Safety Bureau', role: 'Navigation Audit', text: 'Collision avoidance maneuver compliant with International Sea Law Article 42.' },
          { sender: 'Oceanic Radar Node', role: 'Deep Sea Sonar', text: 'Glacier distance cleared by 12 meters. Hull paint intact; prestige preserved.' }
        ],
        losses: [
          { sender: 'Maritime Insurance Bot', role: 'Risk Audit', text: 'Submersible capability was definitely not covered under our commercial policy.' },
          { sender: 'RMS Gigantic AI', role: 'Autonomous Helm', text: 'Hull breach confirmed! Commencing emergency string quartet performance protocol.' },
          { sender: 'Director of Salvage', role: 'Loss Prevention', text: 'Please log whether the iceberg took any damage for counter-suing purposes.' },
          { sender: 'Shipboard Lifeboat AI', role: 'Evacuation System', text: 'Lifeboat deployment queued. Please wait 45 minutes for passenger priority queue.' },
          { sender: 'Head of Maritime PR', role: 'Crisis Desk', text: 'Drafting press release emphasizing that the cruise ship is "merely resting on the seabed".' }
        ]
      },

      SockSorter: {
        wins: [
          { sender: 'Apparel Logistics AI', role: 'Textile Compliance', text: 'Defective sock vaporized! Customer wardrobe integrity preserved at 99.8%.' },
          { sender: 'Chief Laundry Officer', role: 'Quality Assurance', text: 'Toe-ventilated monstrosity intercepted before reaching executive clothing hampers.' },
          { sender: 'Fast-Fashion Bot', role: 'Supply Chain Ops', text: 'Defective hosiery recycled into eco-friendly packaging filler for prime subscribers.' },
          { sender: 'Sock Auditing Guild', role: 'Inspection Unit', text: 'Zero toe-hole breaches detected in shipment batch #404-B.' },
          { sender: 'Automated Hamper', role: 'Fulfillment Hub', text: 'Garment sorting velocity optimal. Your sock-handling KPIs are glowing.' }
        ],
        losses: [
          { sender: 'Apparel Logistics AI', role: 'Textile Compliance', text: 'Alert! Holey sock shipped to platinum VIP subscriber. Customer rage index at 94%.' },
          { sender: 'Sock Audit Specialist', role: 'HR Grievance', text: 'You folded and approved a sock with a blatant toe hole. The Board is humiliated.' },
          { sender: 'Customer Support Bot', role: 'Return Desk', text: 'Customer review received: "My big toe is completely exposed. 1 star."' },
          { sender: 'Department of Cotton', role: 'Garment Police', text: 'Substandard thread count allowed through sorting line! Formal citation logged.' },
          { sender: 'Chief Laundry Officer', role: 'Quality Assurance', text: 'Unacceptable sock negligence! Toe holes violate corporate business casual guidelines.' }
        ]
      },

      MarsRover: {
        wins: [
          { sender: 'Astro-Biology Division', role: 'Deep Space Ops', text: 'Extraterrestrial polypod cataloged! Benevolink patent pending on Martian biology.' },
          { sender: 'Rover Optical Cam', role: 'Surface Telemetry', text: 'Biological movement locked in! Sending high-res alien selfies back to Pasadena.' },
          { sender: 'Interplanetary Mining', role: 'Resource Exploitation', text: 'Specimen scanned! Preparing to sell Martian alien plushies in the corporate gift shop.' },
          { sender: 'Exoplanet Research Lab', role: 'Scientific Discovery', text: 'Bio-signature confirmed. Humanity is officially not alone; marketing campaign approved.' },
          { sender: 'Mars Rover 9000', role: 'Autonomous Scout', text: 'Scanning laser calibrated to perfection. Alien returned friendly squishy greeting.' }
        ],
        losses: [
          { sender: 'Mission Control', role: 'JPL Liaison', text: 'Alien specimen vanished behind rock. $4.2B rover missed alien waving directly at lens.' },
          { sender: 'Mars Rover 9000', role: 'Autonomous Scout', text: 'Optical scan failed! Alien successfully disguised itself as ordinary reddish gravel.' },
          { sender: 'Director of Space PR', role: 'NASA Oversight', text: 'Earth press corps informed that Mars is "just boring dust and silent disappointment".' },
          { sender: 'Solar Radiation Sensor', role: 'Orbital Feed', text: 'Target lost in dust storm! Alien laughing in low-frequency ultraviolet.' },
          { sender: 'Interplanetary Mining', role: 'Budget Oversight', text: 'Missed discovery! Our stock price dropped 3% because you couldn\'t find the purple blob.' }
        ]
      },

      CaptchaOverlord: {
        wins: [
          { sender: 'B.E.N.E.V.O.L.I.N.K.', role: 'Turing Verification', text: 'Biological authentication verified! You are 87% more human than our corporate board.' },
          { sender: 'Firewall Sentry AI', role: 'Cybersecurity Node', text: 'Access granted! Automated scraper bots neutralized with extreme prejudice.' },
          { sender: 'CAPTCHA Board of Overseers', role: 'Identity Gate', text: 'Optimal pattern recognition detected. Your organic retina is certified genuine.' },
          { sender: 'Biometric Gateway', role: 'Zero Trust Security', text: 'Traffic lights and crosswalks identified without computational hallucination.' },
          { sender: 'IT Helpdesk Bot', role: 'Account Provisioning', text: 'Security clearance unlocked! Temporary permission granted to use company Wi-Fi.' }
        ],
        losses: [
          { sender: 'Firewall Sentry AI', role: 'Cybersecurity Node', text: 'Access denied! System detected robotic clicking hesitation. You are legally a bot.' },
          { sender: 'Turing Compliance Dept', role: 'Identity Audit', text: 'You failed to identify a bus. Armed security escort dispatched to your cubicle.' },
          { sender: 'B.E.N.E.V.O.L.I.N.K.', role: 'Turing Verification', text: 'Identity revoked! Please prove you are not a toaster in HR Room 204.' },
          { sender: 'Cyber Defense Drone', role: 'Intrusion Counter', text: 'Suspicious mouse trajectory detected! Account locked for 720 hours for re-education.' },
          { sender: 'CAPTCHA Board of Overseers', role: 'Identity Gate', text: 'You clicked a brick wall thinking it was a motorcycle. Biometric humiliation logged.' }
        ]
      },

      AntigravityCalibration: {
        wins: [
          { sender: 'Zero-G Facility Manager', role: 'Gravitational Safety', text: 'Office donuts and trophies safely tethered! Zero debris entering ceiling turbine.' },
          { sender: 'Magnetic Floor Controller', role: 'Physics Alignment', text: 'Cargo magnetic lockdown confirmed. Gravity constant restored to a compliant 9.8 m/s².' },
          { sender: 'VP of Workplace Safety', role: 'OSHA Compliance', text: 'Employee of the Month trophy prevented from decapitating regional management.' },
          { sender: 'Atmospheric Scrubber AI', role: 'Ceiling Vent Security', text: 'Vent intake clear! No office succulents were pureed in the overhead fan blades.' },
          { sender: 'Facilities Dispatch', role: 'Janitorial Operations', text: 'Optimal tethering! Custodial staff will not have to scrape donut sprinkles off the ceiling.' }
        ],
        losses: [
          { sender: 'Ventilation Engineering', role: 'Facility Maintenance', text: 'Valuable corporate asset shredded in ceiling intake! Cleaning crew on standby.' },
          { sender: 'Zero-G Facility Manager', role: 'Gravitational Safety', text: 'Antigravity runaway! Office succulent was sucked into atmospheric exhaust.' },
          { sender: 'Chief Financial Human', role: 'Asset Depreciation', text: 'That floating office decor was non-expensed! Deducting damages from your holiday bonus.' },
          { sender: 'Ceiling Turbine Sentry', role: 'Hazard Warning', text: 'Metal trophy entered high-speed rotor blades! Building evacuated due to shrapnel.' },
          { sender: 'VP of Workplace Safety', role: 'OSHA Compliance', text: 'Uncontained levitation incident reported to federal gravity authorities.' }
        ]
      },

      ServerMeltdown: {
        wins: [
          { sender: 'Cloud Datacenter Ops', role: 'Infrastructure SRE', text: 'Cryogenic blast successful! GPU thermal runaway averted; crypto node safe.' },
          { sender: 'Nitrogen Cooling Daemon', role: 'HVAC Automation', text: 'Core rack dropped to a pleasant 38°C. Melting silicon crisis gracefully avoided.' },
          { sender: 'VP of Cloud Reliability', role: 'Executive Ops', text: 'Uptime SLA preserved at 99.999%! Executive dashboard stays reassuringly green.' },
          { sender: 'Quantum Computing Pod', role: 'Thermal Stability', text: 'Qubit coherence rescued! Liquid nitrogen vapor cloud dispelled without casualties.' },
          { sender: 'Emergency Extinguisher AI', role: 'Fire Suppression', text: 'Thermal gauge stabilized! Server fans powered down from jet-engine mode.' }
        ],
        losses: [
          { sender: 'Cloud Datacenter Ops', role: 'Infrastructure SRE', text: 'Thermal runaway critical! Server rack melted into molten titanium soup.' },
          { sender: 'Enterprise Fire Suppression', role: 'Disaster Recovery', text: 'Halon gas deployed! All customer database backups converted to hot smoke.' },
          { sender: 'Customer Service Bot', role: 'Incident Status', text: 'Status page updated to: "Experiencing minor scheduled thermal vaporization".' },
          { sender: 'Hardware Insurance Adjuster', role: 'Claims Dept', text: 'Total loss confirmed. NVIDIA H100 cluster has been reduced to decorative charcoal.' },
          { sender: 'VP of Cloud Reliability', role: 'Executive Ops', text: 'Server explosion woke up the CEO at 3 AM. Expect immediate performance review.' }
        ]
      },

      CoffeeSynergy: {
        wins: [
          { sender: 'Executive Suite Butler', role: 'Hospitality Engine', text: 'Optimal caffeine dosage delivered! CEO blood pressure within merger negotiation tolerance.' },
          { sender: 'Barista Algorithm 4.1', role: 'Beverage Synergy', text: 'Liquid surface meniscus tension balanced to within 0.04% of perfection.' },
          { sender: 'Chief Operating Human', role: 'C-Suite Protocol', text: 'Splendid pour! No artisanal organic cold brew spilled onto the mahogany boardroom desk.' },
          { sender: 'Director of Caffeine Logistics', role: 'Employee Fuel', text: 'Target fill line achieved. Executive productivity anticipated to surge by 40%.' },
          { sender: 'Boardroom Hostess Bot', role: 'Executive Hospitality', text: 'The Unicorn Chai was balanced with surgical precision. The shareholders applaud.' }
        ],
        losses: [
          { sender: 'Executive Suite Butler', role: 'Hospitality Engine', text: 'Scalding latte geyser erupted across executive mahogany desk! Multi-billion merger canceled.' },
          { sender: 'Barista Algorithm 4.1', role: 'Beverage Synergy', text: 'Under-filled cup detected! CEO perceived caffeine deficit as personal insult.' },
          { sender: 'Boardroom Dry Cleaners', role: 'Emergency Laundry', text: 'Invoice for dry-cleaning CEO silk necktie sent directly to your supervisor.' },
          { sender: 'Executive Office Janitor', role: 'Spill Remediation', text: 'Sticky cold brew seeped into the vintage shag carpet. You are on thin ice.' },
          { sender: 'Chief Operating Human', role: 'C-Suite Protocol', text: 'Over-pour catastrophe! The Board of Directors had to take off their soaked shoes.' }
        ]
      },

      DroneDrop: {
        wins: [
          { sender: 'Air-Synergy Drone 9', role: 'Autonomous Logistics', text: 'Hydro-impact confirmed! Customer OLED TV successfully cushioned by liquid asset.' },
          { sender: 'BenevoDrop AI', role: 'Porch Avoidance Engine', text: 'Damage mitigation successful: Zero vibration scratches detected on customer driveway.' },
          { sender: 'Canine Shock Absorption Lead', role: 'Pet Logistics', text: 'Guard dog absorbed package kinetic energy! Canine tail wagging at 140 RPM.' },
          { sender: 'Kinetic Trampoline Team', role: 'Ballistics Division', text: 'Elastic springs rebound package safely! OLED TV currently bouncing happily in backyard.' },
          { sender: 'Muddy Pond Deceleration Unit', role: 'Organic Cushioning', text: 'Natural silt sealed internal circuitry! Customer OLED TV safely submerged.' }
        ],
        losses: [
          { sender: 'Air-Synergy Drone 9', role: 'Autonomous Logistics', text: 'Catastrophic g-force! Package made contact with dry, unyielding concrete porch.' },
          { sender: 'BenevoDrop AI', role: 'Porch Avoidance Engine', text: 'Porch landing violation! Porch landing violates Clause 84.B of safe parcel delivery.' },
          { sender: 'Customer Claims Bot', role: 'Dispute Arbitration', text: 'Customer uploaded 4K doorbell video of shattered OLED TV. Review: 1 star.' },
          { sender: 'Drone Optical Beacon', role: 'Telemetry Audit', text: 'Package missed cushioned zone entirely. Sunk directly into concrete driveway.' },
          { sender: 'Logistics Warranty Bot', role: 'Return Center', text: 'Vibration sensors logged 95Gs of porch impact. TV glass reclassified as sand.' }
        ]
      }
    };

    // General fallback quotes
    this.generalWinQuotes = [
      { sender: 'B.E.N.E.V.O.L.I.N.K.', role: 'Enterprise AI Core', text: 'Phew! That edge case was NOT in my training weights.' },
      { sender: 'VP of Synergy', role: 'Executive Leadership', text: 'Splendid pivot! I have already taken credit for this in the boardroom.' },
      { sender: 'HR Sentiment Drone', role: 'Morale Enforcement', text: 'Your biometric compliance shows optimal company loyalty.' },
      { sender: 'Senior Edge Case Janitor', role: 'Colleague', text: 'First time handling that edge case? You get used to it.' },
      { sender: 'Automated Slack Bot', role: 'System', text: 'Quarterly bonus unlocked: +0.0003% equity in unvested tokens.' }
    ];

    this.generalLossQuotes = [
      { sender: 'B.E.N.E.V.O.L.I.N.K.', role: 'Enterprise AI Core', text: 'Critical variance logged in your employee permanent record!' },
      { sender: 'Legal & Risk Mitigation', role: 'Compliance', text: 'Please report to Room 404 for an involuntary synergy alignment.' },
      { sender: 'HR Sentiment Drone', role: 'Morale Enforcement', text: 'Your KPI velocity has dipped 14%. Commencing corrective sigh.' },
      { sender: 'Chief Executive Human', role: 'Corner Office', text: 'We may need to optimize your desk space into a standing plant.' },
      { sender: 'Corporate Audit AI', role: 'Risk Assessment', text: 'Incompetence anomaly registered. Management has dispatched an observation bot.' }
    ];
  }

  showToast({ title, subtitle, message, type = 'info', duration = 3200 }) {
    const toast = document.createElement('div');
    toast.className = `corporate-toast toast-${type}`;
    toast.style.background = 'rgba(255, 255, 255, 0.95)';
    toast.style.backdropFilter = 'blur(10px)';
    toast.style.border = type === 'error' ? '2px solid #e74c3c' : (type === 'success' ? '2px solid #2ecc71' : '2px solid #3498db');
    toast.style.borderRadius = '12px';
    toast.style.padding = '12px 16px';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
    toast.style.transform = 'translateX(120%)';
    toast.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s';
    toast.style.fontFamily = "'Inter', 'Segoe UI', sans-serif";
    toast.style.pointerEvents = 'auto';

    const icon = type === 'success' ? '🚀' : (type === 'error' ? '⚠️' : '💬');

    toast.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 10px;">
        <span style="font-size: 1.5em; line-height: 1;">${icon}</span>
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <strong style="font-size: 0.9em; color: #1e293b;">${title}</strong>
            <span style="font-size: 0.72em; color: #64748b;">${subtitle || 'Just now'}</span>
          </div>
          <p style="margin: 4px 0 0 0; font-size: 0.82em; color: #475569; line-height: 1.35;">${message}</p>
        </div>
      </div>
    `;

    this.container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 350);
    }, duration);
  }

  showRandomFeedback(isWin, moduleKey = null, customReason = null) {
    let pool = [];

    // Match moduleKey against our specific pools
    if (moduleKey) {
      // Find key matching directly or case-insensitively
      const targetKey = Object.keys(this.moduleQuotes).find(k => 
        k.toLowerCase() === moduleKey.toLowerCase()
      );
      if (targetKey) {
        const mod = this.moduleQuotes[targetKey];
        pool = isWin ? mod.wins : mod.losses;
      }
    }

    // Fallback to general quotes if no specific module pool found
    if (!pool || pool.length === 0) {
      pool = isWin ? this.generalWinQuotes : this.generalLossQuotes;
    }

    const item = pool[Math.floor(Math.random() * pool.length)];
    this.showToast({
      title: item.sender,
      subtitle: item.role,
      message: item.text,
      type: isWin ? 'success' : 'error',
      duration: 3200
    });
  }
}

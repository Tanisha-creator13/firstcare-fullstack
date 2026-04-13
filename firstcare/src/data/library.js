export const LIBRARY = [
  {
    id: 1, condition: 'Burns', category: 'Injuries', icon: '🔥',
    brief: 'Thermal, chemical or electrical skin injury requiring immediate cooling.',
    steps: [
      'Cool the burn under cool (not cold) running water for 10–20 minutes immediately.',
      'Do not use ice, butter, or toothpaste — these worsen the injury.',
      'Remove jewelry or tight clothing near the burn if possible.',
      'Cover loosely with a clean, non-fluffy bandage or cling film.',
      'Seek emergency care for burns larger than a palm, on face/hands/genitals, or if the skin is white/charred.',
    ]
  },
  {
    id: 2, condition: 'Choking', category: 'Breathing', icon: '🫁',
    brief: 'Airway obstruction by a foreign object — a life-threatening emergency.',
    steps: [
      'Encourage the person to cough forcefully if they can.',
      'Give up to 5 firm back blows between the shoulder blades with the heel of your hand.',
      'If back blows fail, give up to 5 abdominal thrusts (Heimlich maneuver).',
      'Alternate 5 back blows and 5 abdominal thrusts until the object is cleared.',
      'Call 112/911 immediately if the person cannot breathe or loses consciousness.',
    ]
  },
  {
    id: 3, condition: 'Nosebleed', category: 'Injuries', icon: '🩸',
    brief: 'Nasal bleeding — usually not serious but requires proper technique.',
    steps: [
      'Sit upright and lean slightly forward (not backward) to avoid swallowing blood.',
      'Pinch the soft part of your nose firmly just below the bony bridge.',
      'Breathe through your mouth and hold for 10–15 minutes continuously.',
      'Apply a cold compress to the top of the nose.',
      'Seek medical care if bleeding lasts over 20 minutes, follows a head injury, or is very heavy.',
    ]
  },
  {
    id: 4, condition: 'Fracture', category: 'Injuries', icon: '🦴',
    brief: 'Suspected broken bone — immobilize and seek medical evaluation.',
    steps: [
      'Do not attempt to straighten or realign the bone.',
      'Immobilize the injured area using a splint or improvised support (e.g., folded newspaper).',
      'Apply a cold compress wrapped in cloth — never directly on skin.',
      'Elevate the injured limb if possible to reduce swelling.',
      'Call for emergency help or transport to hospital, especially if bone is visible or circulation is impaired.',
    ]
  },
  {
    id: 5, condition: 'Asthma Attack', category: 'Breathing', icon: '💨',
    brief: 'Sudden worsening of breathing in asthma — requires prompt action.',
    steps: [
      'Help the person sit upright in a comfortable position — do not lay them down.',
      'Help them use their reliever inhaler (usually blue) — 1 puff every 30–60 seconds, up to 10 puffs.',
      'Loosen tight clothing around neck and chest.',
      'Stay calm and reassure the person; anxiety worsens attacks.',
      'Call 112/911 if no inhaler is available, symptoms do not improve in 15 minutes, or lips turn blue.',
    ]
  },
  {
    id: 6, condition: 'Allergic Reaction', category: 'Allergic', icon: '⚠️',
    brief: 'Immune response ranging from mild hives to life-threatening anaphylaxis.',
    steps: [
      'Identify and remove the trigger (food, insect, medication) if possible.',
      'For mild reactions (hives, itching): antihistamine if available; monitor closely.',
      'For severe reactions (throat swelling, difficulty breathing): use epinephrine auto-injector (EpiPen) immediately.',
      'Call 112/911 for any signs of anaphylaxis — do not wait to see if it improves.',
      'If epinephrine was given, still seek emergency care — effects are temporary.',
    ]
  },
  {
    id: 7, condition: 'Fainting', category: 'Neurological', icon: '😵',
    brief: 'Brief loss of consciousness due to reduced blood flow to the brain.',
    steps: [
      'If person is about to faint: lay them down and elevate their legs 12 inches.',
      'Loosen any tight clothing, especially around the neck.',
      'Ensure fresh air circulation — open windows or move outdoors.',
      'Once conscious, have them lie still for a few minutes before sitting up slowly.',
      'Seek medical attention if fainting lasts more than a minute, recurs, or follows a head injury.',
    ]
  },
  {
    id: 8, condition: 'Heatstroke', category: 'Other', icon: '☀️',
    brief: 'Body temperature above 40°C / 104°F — a medical emergency.',
    steps: [
      'Call 112/911 immediately — heatstroke is life-threatening.',
      'Move the person to a cool, shaded area or air-conditioned space.',
      'Remove excess clothing and cool rapidly: cold wet cloths, ice packs on neck/armpits/groin.',
      'Fan the person to enhance evaporation.',
      'Do not give fluids if the person is confused or unconscious.',
    ]
  },
  {
    id: 9, condition: 'Seizure', category: 'Neurological', icon: '⚡',
    brief: 'Uncontrolled electrical activity in the brain — protect the person from injury.',
    steps: [
      'Stay calm. Time the seizure duration.',
      'Clear the area of hard or sharp objects; cushion the head.',
      'Roll the person on their side (recovery position) to prevent choking.',
      'Never restrain the person or put anything in their mouth.',
      'Call 112/911 if seizure lasts more than 5 minutes, person does not regain consciousness, or this is their first seizure.',
    ]
  },
  {
    id: 10, condition: 'Chest Pain', category: 'Cardiac', icon: '❤️',
    brief: 'Pain in the chest that may indicate a cardiac event — always take seriously.',
    steps: [
      'Call 112/911 immediately if pain is severe, crushing, or accompanied by sweating/arm pain/jaw pain.',
      'Help the person sit or lie in the most comfortable position.',
      'Loosen tight clothing and ensure they can breathe freely.',
      'If conscious and not allergic, offer one adult aspirin (325mg) to chew — not swallow.',
      'Monitor breathing and pulse. Begin CPR if they become unresponsive and stop breathing normally.',
    ]
  },
  {
    id: 11, condition: 'Cuts & Wounds', category: 'Injuries', icon: '🩹',
    brief: 'Lacerations requiring cleaning, pressure, and sometimes professional closure.',
    steps: [
      'Apply direct pressure with a clean cloth or gauze for 10–15 minutes without peaking.',
      'Once bleeding slows, rinse wound gently with clean running water.',
      'Do not probe the wound or remove embedded objects.',
      'Apply antiseptic if available, then cover with sterile dressing.',
      'Seek medical care if wound is deep, edges gape, won\'t stop bleeding, or involves the face/hands.',
    ]
  },
  {
    id: 12, condition: 'Fever', category: 'Fever', icon: '🌡️',
    brief: 'Elevated body temperature — a sign the immune system is responding.',
    steps: [
      'Keep the person comfortable and hydrated — water, clear broth, diluted juice.',
      'Use a lightweight blanket — do not bundle up excessively.',
      'Paracetamol or ibuprofen at correct dose can help reduce fever if tolerated.',
      'Apply a cool damp cloth to the forehead for comfort.',
      'Seek care for: fever over 39.4°C in adults, any fever in infants under 3 months, fever lasting more than 3 days, or accompanied by stiff neck/confusion.',
    ]
  },
  {
    id: 13, condition: 'Poisoning', category: 'Digestive', icon: '☠️',
    brief: 'Ingestion of a toxic substance — do not induce vomiting without guidance.',
    steps: [
      'Call Poison Control or 112/911 immediately.',
      'Try to identify the substance: name, quantity, and time of ingestion.',
      'Do not induce vomiting unless specifically directed by Poison Control.',
      'If person is unconscious but breathing, place in recovery position.',
      'Bring the container or label to the hospital for identification.',
    ]
  },
  {
    id: 14, condition: 'Diabetic Emergency', category: 'Other', icon: '🩸',
    brief: 'Low blood sugar (hypoglycemia) is the most common — act fast.',
    steps: [
      'If person is conscious and can swallow: give 15–20g of fast-acting sugar (glucose tablets, juice, regular soda, or 3–4 tsp of sugar).',
      'Have them sit or lie down and rest for 15 minutes.',
      'Recheck symptoms; repeat sugar intake if still symptomatic.',
      'Once recovered, offer a small snack with complex carbs and protein.',
      'Call 112/911 if person is unconscious, cannot swallow, or does not improve within 15 minutes.',
    ]
  },
  {
    id: 15, condition: 'Head Injury', category: 'Neurological', icon: '🧠',
    brief: 'Blunt trauma to the head — even mild impacts can cause serious injury.',
    steps: [
      'Call 112/911 if person is unconscious, confused, vomiting repeatedly, or has unequal pupils.',
      'Keep the person still — do not move them unnecessarily in case of spinal injury.',
      'Apply gentle pressure to wounds but not to the skull itself.',
      'Do not give pain medications containing blood thinners (aspirin/ibuprofen) — use paracetamol only.',
      'Monitor for 24 hours for worsening headache, drowsiness, or behavioral changes.',
    ]
  },
  {
    id: 16, condition: 'Sprain', category: 'Injuries', icon: '🦶',
    brief: 'Stretched or torn ligament — use RICE method within first 48 hours.',
    steps: [
      'Rest: Stop the activity and avoid putting weight on the injured joint.',
      'Ice: Apply ice wrapped in a cloth for 20 minutes every 2–3 hours.',
      'Compression: Wrap with an elastic bandage — firm but not tight enough to restrict circulation.',
      'Elevation: Raise the injured limb above heart level to reduce swelling.',
      'See a doctor if you cannot bear any weight, hear a pop, or the area is numb.',
    ]
  },
  {
    id: 17, condition: 'Eye Injury', category: 'Injuries', icon: '👁️',
    brief: 'Chemical splash, foreign object, or trauma to the eye.',
    steps: [
      'Chemical splash: Immediately flush with clean water for 15–20 minutes. Hold eye open under running water.',
      'Foreign object: Do not rub. Blink repeatedly or use clean water to flush.',
      'Do not attempt to remove embedded objects — cover the eye loosely.',
      'Do not apply pressure to the eyeball.',
      'Seek emergency care for chemical exposure, penetrating objects, significant pain, or vision changes.',
    ]
  },
  {
    id: 18, condition: 'Bee Sting', category: 'Allergic', icon: '🐝',
    brief: 'Most stings are painful but minor; watch closely for allergic response.',
    steps: [
      'Remove the stinger immediately by scraping sideways with a credit card — do not squeeze.',
      'Wash the area with soap and water.',
      'Apply a cold compress to reduce swelling and pain.',
      'Oral antihistamine can help with itching; topical hydrocortisone reduces local reaction.',
      'Call 112/911 immediately if hives, swelling of face/throat, difficulty breathing, or dizziness develop.',
    ]
  },
  {
    id: 19, condition: 'Vomiting', category: 'Digestive', icon: '🤢',
    brief: 'Persistent vomiting can lead to dehydration — rest and hydration are key.',
    steps: [
      'Rest quietly and avoid solid food until vomiting stops.',
      'Sip small amounts of clear fluids (water, broth, diluted juice) frequently — not large amounts at once.',
      'Avoid dairy, greasy foods, caffeine, and alcohol.',
      'Oral rehydration salts (ORS) are ideal for replacing lost electrolytes.',
      'Seek care if vomiting lasts more than 24 hours, there is blood in vomit, or signs of dehydration appear (no urine, dry mouth, confusion).',
    ]
  },
  {
    id: 20, condition: 'Drowning', category: 'Other', icon: '🌊',
    brief: 'Water-related breathing emergency — every second counts.',
    steps: [
      'Call 112/911 before attempting rescue if possible.',
      'Remove the person from water safely — use a rope, pole, or life ring rather than entering water yourself.',
      'Check for breathing immediately. If not breathing, begin CPR (30 compressions : 2 breaths).',
      'Do not tilt head or attempt to drain water — begin rescue breathing while still in water if trained.',
      'All drowning victims must be evaluated by a doctor — secondary drowning can occur hours later.',
    ]
  },
]

export const CATEGORIES = ['All', 'Injuries', 'Breathing', 'Cardiac', 'Allergic', 'Neurological', 'Digestive', 'Fever', 'Other']

"""Run once to populate the first_aid_library table."""

LIBRARY_DATA = [
    {
        "condition_name": "Burns",
        "category": "Injuries",
        "icon": "🔥",
        "description": "Thermal, chemical or electrical skin injury requiring immediate cooling.",
        "steps": [
            "Cool the burn under cool (not cold) running water for 10–20 minutes immediately.",
            "Do not use ice, butter, or toothpaste — these worsen the injury.",
            "Remove jewelry or tight clothing near the burn if possible.",
            "Cover loosely with a clean, non-fluffy bandage or cling film.",
            "Seek emergency care for burns larger than a palm, on face/hands/genitals, or if the skin is white/charred.",
        ],
    },
    {
        "condition_name": "Choking",
        "category": "Breathing",
        "icon": "🫁",
        "description": "Airway obstruction by a foreign object — a life-threatening emergency.",
        "steps": [
            "Encourage the person to cough forcefully if they can.",
            "Give up to 5 firm back blows between the shoulder blades with the heel of your hand.",
            "If back blows fail, give up to 5 abdominal thrusts (Heimlich maneuver).",
            "Alternate 5 back blows and 5 abdominal thrusts until the object is cleared.",
            "Call 112/911 immediately if the person cannot breathe or loses consciousness.",
        ],
    },
    {
        "condition_name": "Nosebleed",
        "category": "Injuries",
        "icon": "🩸",
        "description": "Nasal bleeding — usually not serious but requires proper technique.",
        "steps": [
            "Sit upright and lean slightly forward (not backward) to avoid swallowing blood.",
            "Pinch the soft part of your nose firmly just below the bony bridge.",
            "Breathe through your mouth and hold for 10–15 minutes continuously.",
            "Apply a cold compress to the top of the nose.",
            "Seek medical care if bleeding lasts over 20 minutes, follows a head injury, or is very heavy.",
        ],
    },
    {
        "condition_name": "Fracture",
        "category": "Injuries",
        "icon": "🦴",
        "description": "Suspected broken bone — immobilize and seek medical evaluation.",
        "steps": [
            "Do not attempt to straighten or realign the bone.",
            "Immobilize the injured area using a splint or improvised support.",
            "Apply a cold compress wrapped in cloth — never directly on skin.",
            "Elevate the injured limb if possible to reduce swelling.",
            "Call for emergency help or transport to hospital, especially if bone is visible.",
        ],
    },
    {
        "condition_name": "Asthma Attack",
        "category": "Breathing",
        "icon": "💨",
        "description": "Sudden worsening of breathing in asthma — requires prompt action.",
        "steps": [
            "Help the person sit upright — do not lay them down.",
            "Help them use their reliever inhaler (usually blue) — 1 puff every 30–60 seconds, up to 10 puffs.",
            "Loosen tight clothing around neck and chest.",
            "Stay calm and reassure the person; anxiety worsens attacks.",
            "Call 112/911 if no inhaler is available, symptoms do not improve in 15 minutes, or lips turn blue.",
        ],
    },
    {
        "condition_name": "Allergic Reaction",
        "category": "Allergic",
        "icon": "⚠️",
        "description": "Immune response ranging from mild hives to life-threatening anaphylaxis.",
        "steps": [
            "Identify and remove the trigger (food, insect, medication) if possible.",
            "For mild reactions (hives, itching): antihistamine if available; monitor closely.",
            "For severe reactions (throat swelling, difficulty breathing): use epinephrine auto-injector immediately.",
            "Call 112/911 for any signs of anaphylaxis — do not wait.",
            "If epinephrine was given, still seek emergency care — effects are temporary.",
        ],
    },
    {
        "condition_name": "Fainting",
        "category": "Neurological",
        "icon": "😵",
        "description": "Brief loss of consciousness due to reduced blood flow to the brain.",
        "steps": [
            "If person is about to faint: lay them down and elevate their legs 12 inches.",
            "Loosen any tight clothing, especially around the neck.",
            "Ensure fresh air circulation — open windows or move outdoors.",
            "Once conscious, have them lie still for a few minutes before sitting up slowly.",
            "Seek medical attention if fainting lasts more than a minute or follows a head injury.",
        ],
    },
    {
        "condition_name": "Heatstroke",
        "category": "Other",
        "icon": "☀️",
        "description": "Body temperature above 40°C / 104°F — a medical emergency.",
        "steps": [
            "Call 112/911 immediately — heatstroke is life-threatening.",
            "Move the person to a cool, shaded area or air-conditioned space.",
            "Remove excess clothing and cool rapidly: cold wet cloths, ice packs on neck/armpits/groin.",
            "Fan the person to enhance evaporation.",
            "Do not give fluids if the person is confused or unconscious.",
        ],
    },
    {
        "condition_name": "Seizure",
        "category": "Neurological",
        "icon": "⚡",
        "description": "Uncontrolled electrical activity in the brain — protect from injury.",
        "steps": [
            "Stay calm. Time the seizure duration.",
            "Clear the area of hard or sharp objects; cushion the head.",
            "Roll the person on their side (recovery position) to prevent choking.",
            "Never restrain the person or put anything in their mouth.",
            "Call 112/911 if seizure lasts more than 5 minutes or this is their first seizure.",
        ],
    },
    {
        "condition_name": "Chest Pain",
        "category": "Cardiac",
        "icon": "❤️",
        "description": "Pain in the chest that may indicate a cardiac event — always take seriously.",
        "steps": [
            "Call 112/911 immediately if pain is severe, crushing, or accompanied by sweating/arm pain.",
            "Help the person sit or lie in the most comfortable position.",
            "Loosen tight clothing and ensure they can breathe freely.",
            "If conscious and not allergic, offer one adult aspirin (325mg) to chew.",
            "Monitor breathing and pulse. Begin CPR if they become unresponsive.",
        ],
    },
    {
        "condition_name": "Cuts & Wounds",
        "category": "Injuries",
        "icon": "🩹",
        "description": "Lacerations requiring cleaning, pressure, and sometimes professional closure.",
        "steps": [
            "Apply direct pressure with a clean cloth or gauze for 10–15 minutes without peaking.",
            "Once bleeding slows, rinse wound gently with clean running water.",
            "Do not probe the wound or remove embedded objects.",
            "Apply antiseptic if available, then cover with sterile dressing.",
            "Seek medical care if wound is deep, edges gape, won't stop bleeding, or involves the face/hands.",
        ],
    },
    {
        "condition_name": "Fever",
        "category": "Fever",
        "icon": "🌡️",
        "description": "Elevated body temperature — a sign the immune system is responding.",
        "steps": [
            "Keep the person comfortable and hydrated — water, clear broth, diluted juice.",
            "Use a lightweight blanket — do not bundle up excessively.",
            "Paracetamol or ibuprofen at correct dose can help reduce fever if tolerated.",
            "Apply a cool damp cloth to the forehead for comfort.",
            "Seek care for: fever over 39.4°C in adults, any fever in infants under 3 months, or fever lasting more than 3 days.",
        ],
    },
    {
        "condition_name": "Poisoning",
        "category": "Digestive",
        "icon": "☠️",
        "description": "Ingestion of a toxic substance — do not induce vomiting without guidance.",
        "steps": [
            "Call Poison Control or 112/911 immediately.",
            "Try to identify the substance: name, quantity, and time of ingestion.",
            "Do not induce vomiting unless specifically directed by Poison Control.",
            "If person is unconscious but breathing, place in recovery position.",
            "Bring the container or label to the hospital for identification.",
        ],
    },
    {
        "condition_name": "Diabetic Emergency",
        "category": "Other",
        "icon": "🩸",
        "description": "Low blood sugar (hypoglycemia) is the most common — act fast.",
        "steps": [
            "If conscious and can swallow: give 15–20g of fast-acting sugar (glucose tablets, juice, or 3–4 tsp of sugar).",
            "Have them sit or lie down and rest for 15 minutes.",
            "Recheck symptoms; repeat sugar intake if still symptomatic.",
            "Once recovered, offer a small snack with complex carbs and protein.",
            "Call 112/911 if person is unconscious, cannot swallow, or does not improve within 15 minutes.",
        ],
    },
    {
        "condition_name": "Head Injury",
        "category": "Neurological",
        "icon": "🧠",
        "description": "Blunt trauma to the head — even mild impacts can cause serious injury.",
        "steps": [
            "Call 112/911 if person is unconscious, confused, vomiting repeatedly, or has unequal pupils.",
            "Keep the person still — do not move them unnecessarily in case of spinal injury.",
            "Apply gentle pressure to wounds but not to the skull itself.",
            "Do not give aspirin/ibuprofen — use paracetamol only if needed.",
            "Monitor for 24 hours for worsening headache, drowsiness, or behavioral changes.",
        ],
    },
    {
        "condition_name": "Sprain",
        "category": "Injuries",
        "icon": "🦶",
        "description": "Stretched or torn ligament — use RICE method within first 48 hours.",
        "steps": [
            "Rest: Stop the activity and avoid putting weight on the injured joint.",
            "Ice: Apply ice wrapped in a cloth for 20 minutes every 2–3 hours.",
            "Compression: Wrap with an elastic bandage — firm but not cutting off circulation.",
            "Elevation: Raise the injured limb above heart level to reduce swelling.",
            "See a doctor if you cannot bear any weight, heard a pop, or the area is numb.",
        ],
    },
    {
        "condition_name": "Eye Injury",
        "category": "Injuries",
        "icon": "👁️",
        "description": "Chemical splash, foreign object, or trauma to the eye.",
        "steps": [
            "Chemical splash: Flush with clean water for 15–20 minutes immediately.",
            "Foreign object: Do not rub. Blink repeatedly or use clean water to flush.",
            "Do not attempt to remove embedded objects — cover the eye loosely.",
            "Do not apply pressure to the eyeball.",
            "Seek emergency care for chemical exposure, penetrating objects, or vision changes.",
        ],
    },
    {
        "condition_name": "Bee Sting",
        "category": "Allergic",
        "icon": "🐝",
        "description": "Most stings are painful but minor; watch closely for allergic response.",
        "steps": [
            "Remove the stinger immediately by scraping sideways with a credit card — do not squeeze.",
            "Wash the area with soap and water.",
            "Apply a cold compress to reduce swelling and pain.",
            "Oral antihistamine can help with itching; topical hydrocortisone reduces local reaction.",
            "Call 112/911 if hives, face swelling, difficulty breathing, or dizziness develop.",
        ],
    },
    {
        "condition_name": "Vomiting",
        "category": "Digestive",
        "icon": "🤢",
        "description": "Persistent vomiting can lead to dehydration — rest and hydration are key.",
        "steps": [
            "Rest and avoid solid food until vomiting stops.",
            "Sip small amounts of clear fluids frequently — not large amounts at once.",
            "Avoid dairy, greasy foods, caffeine, and alcohol.",
            "Oral rehydration salts (ORS) are ideal for replacing lost electrolytes.",
            "Seek care if vomiting lasts more than 24 hours, there is blood in vomit, or signs of dehydration appear.",
        ],
    },
    {
        "condition_name": "Drowning",
        "category": "Other",
        "icon": "🌊",
        "description": "Water-related breathing emergency — every second counts.",
        "steps": [
            "Call 112/911 before attempting rescue if possible.",
            "Remove the person from water safely — use a rope, pole, or life ring rather than entering water yourself.",
            "Check for breathing immediately. If not breathing, begin CPR (30 compressions : 2 breaths).",
            "Do not tilt head to drain water — begin rescue breathing immediately.",
            "All drowning victims must be evaluated by a doctor — secondary drowning can occur hours later.",
        ],
    },
]


def seed(db_session):
    from models import FirstAidLibrary
    existing = db_session.query(FirstAidLibrary).count()
    if existing >= len(LIBRARY_DATA):
        print(f"Library already seeded ({existing} entries). Skipping.")
        return
    for item in LIBRARY_DATA:
        db_session.add(FirstAidLibrary(**item))
    db_session.commit()
    print(f"Seeded {len(LIBRARY_DATA)} library entries.")

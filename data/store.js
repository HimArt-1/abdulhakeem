const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

// Initial seed data with high fidelity Arabic content
const initialData = {
  factories: [
    {
      id: "fac-coffee",
      name: "محمصة ومصنع مسار البن",
      tagline: "من الحبّة الخضراء إلى الفنجان الذهبي",
      sector: "قهوة ومشروبات",
      sectorSlug: "coffee",
      sectorColor: "#965628",
      sectorIcon: "coffee",
      city: "الرياض",
      district: "حي النخيل - المنطقة الصناعية الثانية",
      established: "2019",
      description: "منشأة متقدمة متخصصة في فرز وتحميص محاصيل القهوة المختصة بأحدث المحامص الهوائية والتقنية السويسرية، مع مختبر حسي معتمد لاختبار جودة كل قطفة قبل تعبئتها.",
      story: "بدأت الحكاية بشغف فنجان، وتحولت إلى خط إنتاج يحمص أكثر من 20 طنًا شهريًا من أجود محاصيل جازان واليمن وإفريقيا وفق أعلى المعايير البيئية.",
      coverImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&auto=format&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1518832553480-cd0e625ed3e6?w=800&auto=format&fit=crop&q=80"
      ],
      isAcceptingRequests: true,
      status: "published", // published, pending, paused
      isDemo: true,
      products: [
        {
          name: "بن خولاني سعودي مختص",
          desc: "محصول فاخر من مزارع جبال الداير بجازان بمعالجة مجففة لاهوائية.",
          image: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=400&auto=format&fit=crop&q=80",
          tag: "محصول وطني"
        },
        {
          name: "أظرف التقطير الفورية",
          desc: "أظرف معبأة بنيتروجين معزول لحفظ الإيحاءات العطرية حتى لحظة الصب.",
          image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80",
          tag: "ابتكار تعبئة"
        },
        {
          name: "كبسولات ألمنيوم قابلة لإعادة التدوير",
          desc: "متوافقة مع أجهزة الإسبريسو المنزلية بخلطة أرابيكا 100%.",
          image: "https://images.unsplash.com/photo-1518832553480-cd0e625ed3e6?w=400&auto=format&fit=crop&q=80",
          tag: "صديق للبيئة"
        }
      ],
      tourExperience: {
        title: "رحلة الحبة: كيمياء التحميص وسر النكهة",
        overview: "جولة حية داخل عنابر التحميص والتبريد، تراقب فيها تحول الحبوب الخضراء وتسمع 'الفرقعة الأولى'، وتختمها بجلسة تذوق حسي تفرّق فيها بين النوتات الفاكهية والشوكولاتية.",
        duration: "60 دقيقة",
        capacity: 15,
        acceptedPurposes: ["explore", "learn", "collaborate"],
        targetGroups: ["العائلات ومحبو القهوة", "طلاب الهندسة الزراعية والغذائية", "أصحاب المقاهي والمستثمرون"],
        requirements: [
          "ارتداء حذاء مغلق ومريح للمشي داخل صالة الإنتاج",
          "تجنب وضع عطور قوية قبل الجولة لضمان دقة تجربة التذوق الحسي",
          "ارتداء المعطف وغطاء الرأس المعقمين (يتم تسليمهما مجانًا عند البوابة)",
          "الالتزام بمسار الزوار المحدد وعدم لمس المحامص أثناء التشغيل"
        ],
        arrivalInstructions: "البوابة الغربية رقم 3 - مكتب استقبال الزوار بجوار المختبر الحسي. يتوفر موقف سيارات مظلل."
      },
      stations: [
        {
          id: "st-cf-1",
          order: 1,
          title: "مستودع الحبوب الخضراء وفرز الشوائب",
          shortDesc: "فحص رطوبة المحاصيل والتصنيف البصري وكثافة الحبة قبل التحميص.",
          fullDesc: "يبدأ الزائر رحلته في مستودع ذي رطوبة وحرارة مضبوطتين بدقة. نكشف هنا الفارق بين حبوب الأرابيكا الإثيوبية والخولانية السعودية، ونتعرف على جهاز الفرز الكهروبصري الذي يستبعد الحبوب المعيبة في أجزاء من الثانية.",
          photo: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=600&auto=format&fit=crop&q=80"
        },
        {
          id: "st-cf-2",
          order: 2,
          title: "صالة المحامص الهوائية والفرقعة الأولى",
          shortDesc: "مشاهدة انتقال الحرارة وتفاعل ميلارد ورصد منحنيات التحميص رقميًا.",
          fullDesc: "قلب المصنع النابض! يقف الزوار أمام المحامص الألمانية الذكية، يرون عبر النافذة الزجاجية تدرج لون الحبوب من الأخضر إلى الأصفر الذهبي ثم البني الغني، ويسمعون صوت 'الفرقعة الأولى' الدال على انفجار خلايا النكهة.",
          photo: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80"
        },
        {
          id: "st-cf-3",
          order: 3,
          title: "صواني التبريد السريع وإزالة الغازات",
          shortDesc: "إيقاف التحميص في ثوانٍ معدودة وحبس الزيوت العطرية الثمينة.",
          fullDesc: "خروج دفعة التحميص الساخنة إلى قرص التبريد الدوار مع شفاطات الهواء القوية، لمنع الاحتراق الزائد وتثبيت النوتات العطرية بدقة بالغة.",
          photo: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&auto=format&fit=crop&q=80"
        },
        {
          id: "st-cf-4",
          order: 4,
          title: "مختبر التقييم الحسي والتذوق (Cupping Lab)",
          shortDesc: "استخلاص العينات وفق بروتوكول جمعية القهوة المختصة العالمية (SCA).",
          fullDesc: "المحطة الأجمل! يجلس الزوار حول طاولة التذوق الدائرية، يستنشقون القهوة الجافة ثم الرطبة، ويكسرون القشرة العلوية بالملعقة ويتذوقون النوتات المختلفة باحترافية وتوجيه خبير التحميص.",
          photo: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80"
        }
      ],
      regularSlots: [
        { id: "slot-cf-1", day: "الأحد", time: "10:00 ص", dateRange: "أسبوعيًا", maxCapacity: 15 },
        { id: "slot-cf-2", day: "الثلاثاء", time: "04:30 م", dateRange: "أسبوعيًا", maxCapacity: 15 },
        { id: "slot-cf-3", day: "الخميس", time: "11:00 ص", dateRange: "أسبوعيًا", maxCapacity: 15 }
      ],
      blackoutDates: ["2026-10-01", "2026-10-02"],
      managerAccount: {
        username: "coffee_mgr",
        displayName: "م. تركي القحطاني (مدير تشغيل مسار البن)",
        phone: "+966501234561",
        email: "t.qahtani@masarcoffee.sa"
      }
    },
    {
      id: "fac-chocolate",
      name: "مصنع قطيفة للكاكاو والشوكولاتة الحرفية",
      tagline: "من ثمرة الكاكاو إلى أول قضمة تذوب",
      sector: "شوكولاتة وحلويات",
      sectorSlug: "chocolate",
      sectorColor: "#663319",
      sectorIcon: "chocolate",
      city: "جدة",
      district: "طريق المدينة - منطقة الخمرة الصناعية",
      established: "2021",
      description: "أول مصنع حرفي متكامل في المنطقة الغربية يتبع فلسفة (Bean-to-Bar)؛ يستورد قرون وحبوب الكاكاو النادرة من أمريكا الجنوبية وإفريقيا ويصنع قوالب الشوكولاتة بنسبة نقاء تصل إلى 85%.",
      story: "شغف بصناعة متعة حقيقية بدون دهون مهدرجة أو نكهات صناعية، بأيدي صانعي شوكولاتة سعوديين تدربوا في بلجيكا وسويسرا.",
      coverImage: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=1000&auto=format&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80"
      ],
      isAcceptingRequests: true,
      status: "published",
      isDemo: true,
      products: [
        {
          name: "قالب شوكولاتة داكنة 72% بحبات الهيل",
          desc: "مزيج متناغم بين كاكاو مدغشقر ونفحات الهيل السعودي الأخضر.",
          image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&auto=format&fit=crop&q=80",
          tag: "الأكثر طلبًا"
        },
        {
          name: "ترافل محشو بكراميل التمر المديني",
          desc: "شوكولاتة الحليب الفاخرة بحشوة غنية من تمر العجوة ولمسة ملح بحري.",
          image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&auto=format&fit=crop&q=80",
          tag: "مبتكر"
        },
        {
          name: "زبدة كاكاو معصورة على البارد",
          desc: "نقاء غذائي وتجميلي فائق مستخرج مباشرة من ضواغط الكاكاو الهيدروليكية.",
          image: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&auto=format&fit=crop&q=80",
          tag: "عضوي 100%"
        }
      ],
      tourExperience: {
        title: "كيمياء التذوق: كيف تصبح الحبة الصلبة سبيكة حريرية؟",
        overview: "تشهدون بأعينكم كسر قرن الكاكاو، وفصل القشور، ومطاحن الجرانيت التي تطحن الحبيبات لـ 72 ساعة متواصلة حتى الوصول لنعومة الميكرون، مع تجربة صب قالبكم الخاص!",
        duration: "75 دقيقة",
        capacity: 12,
        acceptedPurposes: ["explore", "learn", "collaborate"],
        targetGroups: ["العائلات والأطفال فوق 6 سنوات", "رحلات المدارس والجامعات", "طهاة المعجنات والمتاجر الراقية"],
        requirements: [
          "ارتداء شبكة الشعر والسترة البيضاء المعقمة المقدمة عند الدخول",
          "خلع الحلي والساعات قبل الدخول لمنطقة الصب والتشكيل",
          "غسل وتعقيم اليدين في غرفة التعقيم الهوائي قبل خطوط الإنتاج",
          "يُرجى إبلاغ المرشد في حال وجود حساسية شديدة من المكسرات أو منتجات الحليب"
        ],
        arrivalInstructions: "مدخل الزوار الرئيسي - البهو الزجاجي المطل على صالة التبريد. توجد استراحة مجهزة للأهالي."
      },
      stations: [
        {
          id: "st-ch-1",
          order: 1,
          title: "غرفة التحميص وإزالة القشور (Winnowing)",
          shortDesc: "فصل القشرة الرقيقة عن قلب حبة الكاكاو الغني بالدهون المفيدة.",
          fullDesc: "نتعرف على مصدر حبات الكاكاو وكيف يبرز التحميص اللطيف نكهات التوت والمكسرات الدفينة. يرى الزوار تيار الهواء الذي يطيّر القشور الخفيفة ويحتفظ بالنيبس الصلب النقي.",
          photo: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=600&auto=format&fit=crop&q=80"
        },
        {
          id: "st-ch-2",
          order: 2,
          title: "طواحين الكونشينغ الحجرية العملاقة",
          shortDesc: "عجلات صخر الغرانيت التي تدور 72 ساعة لتقليص حجم الجزيئات إلى 18 ميكرون.",
          fullDesc: "هنا يتحول الكاكاو الصلب إلى سائل بني مخملي لامع بفعل الاحتكاك الطبيعي والحرارة الهادئة. نختبر تذوق عينة بعد 12 ساعة وأخرى بعد 60 ساعة لملاحظة اختفاء المرارة الحادة وتصاعد الملمس الحريري.",
          photo: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80"
        },
        {
          id: "st-ch-3",
          order: 3,
          title: "وحدة التقسية الحرارية وضبط البلورات (Tempering)",
          shortDesc: "تسخين وتبريد محسوب بالملليغرام لتكوين بلورات البيتا المسؤولة عن لمعان الشوكولاتة وصوت قرمشتها.",
          fullDesc: "السر العلمي وراء الشوكولاتة التي لا تذوب في يدك وتذوب فور ملامسة لسانك! يشرح صانع الشوكولاتة كيفية قراءة جهاز الثرموميتر الدقيق وتحقيق اللمعان الزجاجي.",
          photo: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80"
        },
        {
          id: "st-ch-4",
          order: 4,
          title: "ورشة الصب في القوالب وتزيين الترافل",
          shortDesc: "صب الشوكولاتة السائلة في قوالب البوليكربونات وإضافة حبات المكسرات والتوت المجفف.",
          fullDesc: "محطة تفاعلية بالكامل: يرتدي الزائر القفازات المخصصة ويملأ قالبه الشخصي ويزينه بالهيل أو الفستق أو الورد، ويتركه في نفق التبريد ليستلمه مغلفًا باسمه بنهاية الجولة!",
          photo: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80"
        }
      ],
      regularSlots: [
        { id: "slot-ch-1", day: "الإثنين", time: "11:00 ص", dateRange: "أسبوعيًا", maxCapacity: 12 },
        { id: "slot-ch-2", day: "الأربعاء", time: "05:00 م", dateRange: "أسبوعيًا", maxCapacity: 12 },
        { id: "slot-ch-3", day: "السبت", time: "10:30 ص", dateRange: "أسبوعيًا", maxCapacity: 12 }
      ],
      blackoutDates: [],
      managerAccount: {
        username: "choco_mgr",
        displayName: "أ. ليلى البسام (مديرة تجربة الزوار - قطيفة)",
        phone: "+966509876542",
        email: "l.bassam@qateefa-choc.sa"
      }
    },
    {
      id: "fac-perfume",
      name: "دار نفحات للزيوت العطرية والتقطير",
      tagline: "اصنع حكايتك العطرية من بتلات الطبيعة",
      sector: "عطور ومستحضرات",
      sectorSlug: "perfume",
      sectorColor: "#7C3A84",
      sectorIcon: "sparkles",
      city: "الطائف",
      district: "منطقة الهدا - مزارع الورد العطري",
      established: "2017",
      description: "منشأة وطنية تمزج بين عراقة تقطير الورد الطائفي بأواني النحاس التقليدية، وأحدث تقنيات الاستخلاص بثاني أكسيد الكربون فوق الحرج (Supercritical CO2)، لإنتاج زيوت نقية لكبرى دور العطور العالمية.",
      story: "من حقول الورد التي تعانق سحاب جبال الحجاز منذ قرون، أردنا توثيق كيمياء العطر ونقلها من مجرد تجارة إلى تجربة فنية ملهمة تخلّد الذاكرة السعودية.",
      coverImage: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=1000&auto=format&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=800&auto=format&fit=crop&q=80"
      ],
      isAcceptingRequests: true,
      status: "published",
      isDemo: true,
      products: [
        {
          name: "دهن الورد الطائفي النخب الأول",
          desc: "تولة صافية مستخلصة من أربعين ألف بتلة ورد طازجة مقطوفة عند الفجر.",
          image: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=400&auto=format&fit=crop&q=80",
          tag: "نادر ومحدود"
        },
        {
          name: "ماء الورد المركز للطهي والعناية",
          desc: "مقطر نقي خالٍ من الإضافات الكيميائية بتعبئة زجاجية معتمة تحميه من الضوء.",
          image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&auto=format&fit=crop&q=80",
          tag: "طبيعي 100%"
        },
        {
          name: "عطر خشب الصندل واللبان الحوجري",
          desc: "عطر نيش معتق يدمج خشب الصندل العريق مع نفحات لبان ظفار البارد.",
          image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=400&auto=format&fit=crop&q=80",
          tag: "توليفة خاصة"
        }
      ],
      tourExperience: {
        title: "أسرار الأنف العطري ومعجزة التقطير البخاري",
        overview: "تبدأ الجولة باستنشاق عبير البتلات الندية، ثم معاينة القدور النحاسية العتيقة وتكثف قطرات الزيت العطري الثمينة، وتنتهي في مكتبة العطور لتكوين عينتكم العطرية الخاصة.",
        duration: "50 دقيقة",
        capacity: 10,
        acceptedPurposes: ["explore", "learn", "collaborate"],
        targetGroups: ["العائلات والمهتمون بفنون العطور", "طلاب الكيمياء والصيدلة", "مصممو العطور ورواد الأعمال"],
        requirements: [
          "يُمنع منعًا باتًا رش أي عطور أو مزيلات عرق نفاذة قبل الجولة بساعتين",
          "الحد الأدنى لسن الزائر 10 سنوات نظرًا لحساسية الروائح وحرارة القدور",
          "عدم لمس أنابيب التكثيف النحاسية أثناء عملية التقطير الحية"
        ],
        arrivalInstructions: "مبنى المعمل الرئيسي وسط مزارع الورد - طريق الهدا الدائري. تتوفر حديقة مفتوحة للانتظار."
      },
      stations: [
        {
          id: "st-pf-1",
          order: 1,
          title: "حياض استقبال الورد والوزن الميزاني",
          shortDesc: "استلام الورد المقطوف فجرًا وفرز البتلات الناضجة ووزنها قبل التقطير.",
          fullDesc: "يقف الزائر محاطًا بتلال من الورد الزهري الفواح. يتعلم كيف يتم القطف قبل شروق الشمس عندما تبلغ تركيزات الزيوت الطيارة ذروتها في البتلة.",
          photo: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=600&auto=format&fit=crop&q=80"
        },
        {
          id: "st-pf-2",
          order: 2,
          title: "عنابر القدور النحاسية وأبراج التكثيف",
          shortDesc: "غليان الماء النقي، وتصاعد البخار المشبع بزيوت الورد عبر الأنابيب الباردة.",
          fullDesc: "مشهد ساحر يتصاعد فيه البخار المعطر. يشاهد الزوار كيفية فصل طبقة الدهن العائمة فوق الماء في قوارير التجميع الخاصة المسمّاة 'التلقية'.",
          photo: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80"
        },
        {
          id: "st-pf-3",
          order: 3,
          title: "غرفة التعتيق البارد والتنقية الجزئية",
          shortDesc: "حفظ الزيوت في قوارير مظلمة لشهور لتمتزج ذرات الرائحة وتستقر.",
          fullDesc: "ندخل غرفة هادئة ومظلمة ذات حرارة لا تتجاوز 18 مئوية، حيث تُحفظ الخلطات المعتقة كما تُحفظ الكنوز، وتُزال منها أدنى الرواسب عبر فلاتر قطنية نانوية.",
          photo: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=600&auto=format&fit=crop&q=80"
        },
        {
          id: "st-pf-4",
          order: 4,
          title: "مكتبة النوتات العطرية ومنصة التركيب",
          shortDesc: "التعرف على الهرم العطري (قمة، قلب، قاعدة) وتجربة خلط قطرات خاصة.",
          fullDesc: "جلسة تطبيقية ممتعة يجلس فيها الزوار أمام 'أورغن العطور' الذي يحوي أكثر من 80 خلاصة طبيعية، مع شرح صانع العطور لكيفية كتابة صيغة عطرية متوازنة وثابتة.",
          photo: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&auto=format&fit=crop&q=80"
        }
      ],
      regularSlots: [
        { id: "slot-pf-1", day: "الأحد", time: "09:00 ص", dateRange: "موسمي وأسبوعي", maxCapacity: 10 },
        { id: "slot-pf-2", day: "الثلاثاء", time: "10:30 ص", dateRange: "موسمي وأسبوعي", maxCapacity: 10 },
        { id: "slot-pf-3", day: "الخميس", time: "04:30 م", dateRange: "موسمي وأسبوعي", maxCapacity: 10 }
      ],
      blackoutDates: [],
      managerAccount: {
        username: "perfume_mgr",
        displayName: "د. هاني السالمي (كبير العطارين ومدير المنشأة)",
        phone: "+966503344556",
        email: "h.salmi@nafahat-oud.sa"
      }
    },
    {
      id: "fac-ceramic",
      name: "أتيليه ومسبك فخار وادي حنيفة",
      tagline: "من الطين النقي إلى قطعة تدوم لأجيال",
      sector: "خزف وفنون صناعية",
      sectorSlug: "ceramic",
      sectorColor: "#B04A2F",
      sectorIcon: "palette",
      city: "الرياض",
      district: "الدرعية - ضفاف وادي حنيفة",
      established: "2018",
      description: "مصنع وفضاء فني متخصص في تشكيل الخزف المعماري والأواني التراثية المحدثة، يعتمد على طين ترسبات أودية نجد مع خلطات مستوردة عالية المقاومة، ويضم أفران حرق كهربائية وغازية حتى 1280 مئوية.",
      story: "إعادة إحياء لعلاقة الإنسان النجدي بالأرض والطين، وصياغة أدوات الطعام والديكور بهوية صحراوية معاصرة تجمع بين المتانة والجمال البصري البسيط.",
      coverImage: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1000&auto=format&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&auto=format&fit=crop&q=80"
      ],
      isAcceptingRequests: true,
      status: "published",
      isDemo: true,
      products: [
        {
          name: "أكواب قهوة مجوفة من طين حنيفة",
          desc: "مطلية بطبقة تزجيج حجرية غير لامعة تحتفظ بحرارة القهوة وتعطي ملمسًا ترابيًا دافئًا.",
          image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&auto=format&fit=crop&q=80",
          tag: "صناعة يدوية"
        },
        {
          name: "أطباق تقديم بنقوش نجدية غائرة",
          desc: "خزف حجري محروق لمرتين يتحمل غسالات الصحون وأفران الميكروويف.",
          image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&auto=format&fit=crop&q=80",
          tag: "هوية تراثية"
        },
        {
          name: "بلاط سيراميك جداري معماري",
          desc: "بلاطات زخرفية للمشاريع الفندقية والفلل مستوحاة من عمارة الطين التاريخية.",
          image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&auto=format&fit=crop&q=80",
          tag: "حلول معمارية"
        }
      ],
      tourExperience: {
        title: "حوار النار والطين: كيف يتشكل الوعاء ويثبت لقرون؟",
        overview: "تشاهدون مراحل تنقية الطين وعجنه لإخراج فقاعات الهواء، ودوران العجلة السريعة تحت أنامل الخزافين، ثم أسرار كيمياء التزجيج الملون داخل أفران الحرق شديدة السخونة.",
        duration: "90 دقيقة",
        capacity: 15,
        acceptedPurposes: ["explore", "learn", "collaborate"],
        targetGroups: ["العائلات ومحبو الحرف اليدوية", "طلاب كليات التصميم والعمارة", "المصممون الداخليون ومقاولو الديكور"],
        requirements: [
          "ارتداء ملابس مريحة قابلة للغسل (قد تتعرض لرذاذ طين أو غبار تلميع)",
          "حذاء مغلق مانع للانزلاق",
          "الابتعاد مسافة مترين على الأقل عن واجهات أفران الحرق النشطة",
          "المحافظة على هدوء صالة العجلات الحرفية أثناء العمل الميداني"
        ],
        arrivalInstructions: "البوابة الجنوبية - فناء الدرعية الحرفي. يرجى التجمع عند جناح الاستقبال الخزفي قبل 10 دقائق."
      },
      stations: [
        {
          id: "st-cr-1",
          order: 1,
          title: "أحواض تصفية الطين وماكينة السحب الفراغي (Pugmill)",
          shortDesc: "تجهيز خلطة الصلصال وطرد الهواء لمنع انفجار القطع في الفرن.",
          fullDesc: "نبدأ من كومة التراب الخام. نرى كيف يُمزج بالماء ويُنخل لإزالة الحصى الدقيق، ثم يمر بماكينة السحب الفراغي ليخرج قوالب طين لدنة متجانسة وجاهزة للتشكيل.",
          photo: "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80"
        },
        {
          id: "st-cr-2",
          order: 2,
          title: "صالة عجلات الخزافين والتسوية اليدوية",
          shortDesc: "تمركز الطين ورفعه بالأصابع لتكوين الأكواب والأباريق المتناظرة.",
          fullDesc: "لحظة سحرية تتابع فيها الأعين سرعة دوران القرص وتحول كتلة الطين الصامتة إلى فازة رشيقة في دقيقتين بفضل توازن ضغط اليدين المتقن.",
          photo: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop&q=80"
        },
        {
          id: "st-cr-3",
          order: 3,
          title: "استوديو التزجيج والأكاسيد المعدنية (Glazing)",
          shortDesc: "تغطيس القطع الفخارية في محاليل السيليكا والحديد والكوبالت قبل الحرق.",
          fullDesc: "نكتشف هنا كيف يظهر المحلول رماديًا باهتًا قبل الفرن، لكنه بفضل التفاعل الكيميائي الحراري يتحول بعد الحرق إلى درجات الأزرق الفيروزي أو البني الصخري اللامع.",
          photo: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80"
        },
        {
          id: "st-cr-4",
          order: 4,
          title: "عنابر أفران الحرق الفخاري وحرارة 1250 مئوية",
          shortDesc: "الحرق الأول (البسكويت) ثم الحرق الثاني للزجاج والتبريد المتدرج لـ 24 ساعة.",
          fullDesc: "نرى المؤشرات الرقمية لأفران الغاز المعزولة بطوب الألومينا. يشرح الخبير كيف تلتحم جزيئات السيليكا ليتحول الطين الهش إلى حجر صلب لا ينفذ منه الماء إطلاقًا.",
          photo: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&auto=format&fit=crop&q=80"
        }
      ],
      regularSlots: [
        { id: "slot-cr-1", day: "الإثنين", time: "09:30 ص", dateRange: "أسبوعيًا", maxCapacity: 15 },
        { id: "slot-cr-2", day: "الأربعاء", time: "04:00 م", dateRange: "أسبوعيًا", maxCapacity: 15 },
        { id: "slot-cr-3", day: "السبت", time: "03:00 م", dateRange: "أسبوعيًا", maxCapacity: 15 }
      ],
      blackoutDates: [],
      managerAccount: {
        username: "ceramic_mgr",
        displayName: "أ. مشاعل الدوسري (مشرفة الإنتاج والأتيليه)",
        phone: "+966505566778",
        email: "m.dossary@hanifa-pottery.sa"
      }
    },
    {
      id: "fac-paper",
      name: "مصنع تجديد لتقنيات الورق المستدام",
      tagline: "حياة جديدة لكل ورقة قديمة",
      sector: "تدوير وصناعات بيئية",
      sectorSlug: "paper",
      sectorColor: "#2D6A4F",
      sectorIcon: "recycle",
      city: "الدمام",
      district: "المدينة الصناعية الأولى - قرب ميناء الملك عبد العزيز",
      established: "2016",
      description: "صرح صناعي بيئي متطور يقوم بجمع وفرز المخلفات الكرتونية والورقية من مختلف مناطق المملكة وإعادة تحويلها إلى بكرات ورق كرافت وقواعد تغليف صديقة للبيئة بنسبة تدوير 100%.",
      story: "نؤمن بأن كل كرتونة مستهلكة هي مورد ثمين يحمي الأشجار ويوفر 70% من الطاقة ومصادر المياه مقارنة بالصناعة البكر.",
      coverImage: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1000&auto=format&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&auto=format&fit=crop&q=80"
      ],
      isAcceptingRequests: true,
      status: "published",
      isDemo: true,
      products: [
        {
          name: "بكرات ورق كرافت مقوى (Fluting & Testliner)",
          desc: "بكرات صناعية ضخمة بوزن 2 طن تُستخدم لتصنيع صناديق الشحن والتجارة الإلكترونية.",
          image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=80",
          tag: "صناعي ثقيل"
        },
        {
          name: "أكياس ورقية تسويقية قابلة للتحلل",
          desc: "بديل آمن للبلاستيك مخصص للمخابز والمطاعم ومتاجر الأزياء بمقابض مجدولة.",
          image: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=400&auto=format&fit=crop&q=80",
          tag: "صديق للبيئة"
        },
        {
          name: "حشوات حماية المنتجات المهيكلة (Honeycomb)",
          desc: "حشوات كرتونية تمتص الصدمات بديلة لحبيبات الفوم البترولية في التعبئة والتغليف.",
          image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&auto=format&fit=crop&q=80",
          tag: "حماية لوجستية"
        }
      ],
      tourExperience: {
        title: "دورة الحياة الكاملة: من كرتون مستعمل إلى لفة ورقية فائقة الصلابة",
        overview: "تشهدون عمالقة الآلات الهيدروليكية وهي تبتلع أطنان الكرتون وتحولها إلى سائل من الألياف، ثم تمر عبر 40 أسطوانة تجفيف بخارية لتخرج لفة ورق ناعمة ومحكمة السرعة.",
        duration: "60 دقيقة",
        capacity: 20,
        acceptedPurposes: ["explore", "learn", "collaborate"],
        targetGroups: ["العائلات والنشء الواعي بالبيئة", "مدارس التعليم العام والجامعات التقنية", "مديرو سلاسل الإمداد ومصانع الأغذية"],
        requirements: [
          "ارتداء الخوذة الواقية والسترة العاكسة (تُسلّم مجانًا عند البوابة)",
          "الالتزام بالسير داخل الممرات الصفراء المحددة والمحمية بحواجز الأمان",
          "الحد الأدنى لسن الزوار 12 سنة بسبب حركة الرافعات الشوكية وضجيج الآلات",
          "يُمنع التقاط الصور في المناطق الصناعية المحظورة إلا بإذن المرشد"
        ],
        arrivalInstructions: "بوابة السلامة رقم 1 - مبنى التوعية البيئية واستقبال الوفود الصناعية."
      },
      stations: [
        {
          id: "st-pp-1",
          order: 1,
          title: "ساحة الاستقبال وفرز بالات الورق المضغوط",
          shortDesc: "فحص جودة الشحنات الواردة وتصنيف الكرتون بحسب طول الألياف.",
          fullDesc: "يقف الزائر أمام جبال من بالات الورق المضغوط بحجم السيارات الصغيرة. نتعرف هنا على أجهزة كشف الرطوبة اللاسلكية وفصل الأشرطة اللاصقة والمعادن بمغناطيسات فائقة.",
          photo: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80"
        },
        {
          id: "st-pp-2",
          order: 2,
          title: "خلاط اللب الهيدروليكي العملاق (Hydrapulper)",
          shortDesc: "إذابة الكرتون في ماء دافئ مدور وتحويله إلى حساء ألياف سليولوزية.",
          fullDesc: "حوض دوار ضخم يشبه خلاطًا منزليًا بحجم منزل! يتابع الزوار دوران مروحة القاع الفولاذية وهي تفتت أطنان الورق في دقائق معدودة مع ترشيح الدبابيس والبلاستيك.",
          photo: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80"
        },
        {
          id: "st-pp-3",
          order: 3,
          title: "ماكينة التشكيل الحريرية وأسطوانات التجفيف البخارية",
          shortDesc: "بث رذاذ الألياف على شاشات نايلون متحركة وسحب 95% من الماء بالضغط والحرارة.",
          fullDesc: "خط إنتاج يمتد لمسافة 120 مترًا بسرعة 600 متر في الدقيقة! يشاهد الزائر الورق وهو يتشكل كغشاء خفيف ثم يمر فوق أسطوانات حديدية ساخنة تكسبه القوة والمتانة.",
          photo: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80"
        },
        {
          id: "st-pp-4",
          order: 4,
          title: "مقصات الليزر واختبارات الشد والانفجار (Bursting Test)",
          shortDesc: "قص البكرات العملاقة إلى مقاسات العملاء واختبار قدرتها على تحمل أحمال الشحن.",
          fullDesc: "في غرفة الفحص الميكانيكي، يرى الزوار جهاز الاختبار وهو يسلط ضغطًا هيدروليكيًا حتى تنفجر العينة، لضمان مطابقتها للمواصفات والمقاييس السعودية (SASO).",
          photo: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=600&auto=format&fit=crop&q=80"
        }
      ],
      regularSlots: [
        { id: "slot-pp-1", day: "الأحد", time: "09:00 ص", dateRange: "أسبوعيًا", maxCapacity: 20 },
        { id: "slot-pp-2", day: "الثلاثاء", time: "10:30 ص", dateRange: "أسبوعيًا", maxCapacity: 20 },
        { id: "slot-pp-3", day: "الخميس", time: "01:30 م", dateRange: "أسبوعيًا", maxCapacity: 20 }
      ],
      blackoutDates: [],
      managerAccount: {
        username: "paper_mgr",
        displayName: "م. عبد الإله الغامدي (مدير العمليات والسلامة)",
        phone: "+966507788990",
        email: "a.ghamdi@tajdeed-paper.sa"
      }
    }
  ],
  // Public Announced Events (الفعاليات المعلنة)
  events: [
    {
      id: "evt-cf-101",
      factoryId: "fac-coffee",
      factoryName: "محمصة ومصنع مسار البن",
      title: "أمسية التحميص الحي وتذوق محاصيل جازان واليمن",
      date: "2026-10-15",
      time: "06:00 م - 08:30 م",
      dateText: "الخميس 15 أكتوبر 2026",
      totalSeats: 15,
      bookedSeats: 11,
      availableSeats: 4,
      fee: "مجانية (بتسجيل مسبق)",
      description: "فعالية مفتوحة للجمهور تشمل شرحًا مفصلًا من كبير الحماصين لكيفية تفاعل الحبوب، وتجربة تحميص عينة مصغرة، مع طاولة تذوق ممتدة ومشروب ترحيبي.",
      status: "active",
      attendees: [
        { name: "فهد العتيبي", email: "fahad@example.com", seats: 2, bookedAt: "2026-09-20T10:00:00Z" }
      ]
    },
    {
      id: "evt-ch-102",
      factoryId: "fac-chocolate",
      factoryName: "مصنع قطيفة للكاكاو والشوكولاتة الحرفية",
      title: "ورشة صانع الشوكولاتة الصغير والعائلة",
      date: "2026-10-18",
      time: "04:30 م - 07:00 م",
      dateText: "الأحد 18 أكتوبر 2026",
      totalSeats: 12,
      bookedSeats: 10,
      availableSeats: 2,
      fee: "تجريبية مجانية",
      description: "فعالية عائلية مبهجة تتضمن جولة استكشافية للأطفال وأولياء أمورهم وتصميم قوالب شوكولاتة خاصة بحشوات نجدية وحجازية وأخذها للمنزل.",
      status: "active",
      attendees: []
    },
    {
      id: "evt-pf-103",
      factoryId: "fac-perfume",
      factoryName: "دار نفحات للزيوت العطرية والتقطير",
      title: "ندوة التقطير الخريفي وبناء النوتة العطرية",
      date: "2026-10-22",
      time: "05:00 م - 07:30 م",
      dateText: "الخميس 22 أكتوبر 2026",
      totalSeats: 10,
      bookedSeats: 7,
      availableSeats: 3,
      fee: "مجانية",
      description: "لقاء تخصصي للمهتمين وهواة العطور حول التوازن بين الزيوت الطبيعية والمثبتات العطرية وكيف يُصنع العطر الفاخر وفق المواصفات الدولية.",
      status: "active",
      attendees: []
    },
    {
      id: "evt-cr-104",
      factoryId: "fac-ceramic",
      factoryName: "أتيليه ومسبك فخار وادي حنيفة",
      title: "ملتقى النار والطين: عرض حي على العجلة الخزفية",
      date: "2026-10-24",
      time: "03:30 م - 06:00 م",
      dateText: "السبت 24 أكتوبر 2026",
      totalSeats: 14,
      bookedSeats: 13,
      availableSeats: 1,
      fee: "مجانية",
      description: "عرض بصري حي يقدمه أساتذة الخزف لتشكيل أوانٍ ضخمة بارتفاع متر على العجلات الدوارة، مع فرصة تجربة التشكيل لجميع المشاركين.",
      status: "active",
      attendees: []
    },
    {
      id: "evt-pp-105",
      factoryId: "fac-paper",
      factoryName: "مصنع تجديد لتقنيات الورق المستدام",
      title: "مختبر التدوير الأخضر لطلاب المدارس والمخترعين",
      date: "2026-10-28",
      time: "10:00 ص - 12:30 م",
      dateText: "الأربعاء 28 أكتوبر 2026",
      totalSeats: 20,
      bookedSeats: 13,
      availableSeats: 7,
      fee: "مجانية",
      description: "ورشة عمل عملية يصنع فيها كل طالب ورقة يدوية خاصة من لب الكرتون المفروم ويختبر قوتها بنفسه في مختبر الجودة المعتمد.",
      status: "active",
      attendees: []
    }
  ],
  // Visit Requests (Private Tours) - seeded with varied realistic statuses
  requests: [
    {
      id: "REQ-2026-8801",
      factoryId: "fac-coffee",
      factoryName: "محمصة ومصنع مسار البن",
      sector: "قهوة ومشروبات",
      sectorSlug: "coffee",
      purpose: "explore", // explore, learn, collaborate
      purposeLabel: "أكتشف (أفراد وعائلات)",
      visitorId: "usr-visitor-demo",
      visitorName: "سلطان العبدالله",
      visitorEmail: "sultan@example.com",
      visitorPhone: "+966551234567",
      groupDetails: {
        attendeesCount: 4,
        adultsCount: 3,
        childrenCount: 1,
        ageRange: "فوق 12 سنة"
      },
      requestedDate: "2026-10-20",
      requestedSlotTime: "10:00 ص",
      excitedAbout: "متحمس جدًا لمعرفة سر التبريد السريع وسماع صوت الفرقعة الأولى وحضور جلسة التذوق الحسي.",
      status: "pending", // pending, alternative_proposed, confirmed, rejected, cancelled, completed
      createdAt: "2026-09-27T10:15:00Z",
      statusLog: [
        {
          status: "pending",
          timestamp: "2026-09-27T10:15:00Z",
          note: "تم إرسال طلب الزيارة بنجاح وهو بانتظار مراجعة إدارة المصنع."
        }
      ]
    },
    {
      id: "REQ-2026-8802",
      factoryId: "fac-chocolate",
      factoryName: "مصنع قطيفة للكاكاو والشوكولاتة الحرفية",
      sector: "شوكولاتة وحلويات",
      sectorSlug: "chocolate",
      purpose: "learn",
      purposeLabel: "أتعلّم (مؤسسات تعليمية وفرق)",
      visitorId: "usr-visitor-demo",
      visitorName: "سارة المنصور",
      visitorEmail: "sara.almansour@school.edu.sa",
      visitorPhone: "+966559876543",
      groupDetails: {
        entityName: "مدارس الرياض الأهلية - المرحلة المتوسطة",
        academicLevel: "المرحلة المتوسطة (بنين وبنات)",
        studentsCount: 10,
        chaperonesCount: 2,
        educationalGoal: "ربط درس العلوم الكيميائية (حالات المادة وتفاعلات الحرارة) بخطوط إنتاج الشوكولاتة والتقسية الحرارية الواقعية."
      },
      requestedDate: "2026-10-12",
      requestedSlotTime: "11:00 ص",
      excitedAbout: "رؤية طواحين الكونشينغ التي تطحن 72 ساعة وتجربة تعبئة قوالب الشوكولاتة للأشبال.",
      status: "alternative_proposed",
      proposedAlternative: {
        date: "2026-10-14",
        time: "10:30 ص",
        reason: "نرحب بالوفد الكريم، لكن خطوط الصب في 12 أكتوبر مجدولة للصيانة الوقائية الدورية. نرحب بكم يوم الأربعاء 14 أكتوبر مع تخصيص مهندس غذائي مرافق للشرح.",
        proposedAt: "2026-09-27T14:30:00Z"
      },
      createdAt: "2026-09-26T11:00:00Z",
      statusLog: [
        {
          status: "pending",
          timestamp: "2026-09-26T11:00:00Z",
          note: "تم إرسال الطلب من منسقة المدرسة."
        },
        {
          status: "alternative_proposed",
          timestamp: "2026-09-27T14:30:00Z",
          note: "اقترح المصنع موعدًا بديلًا (14 أكتوبر 10:30 ص) وبانتظار موافقة الزائر."
        }
      ]
    },
    {
      id: "REQ-2026-8803",
      factoryId: "fac-perfume",
      factoryName: "دار نفحات للزيوت العطرية والتقطير",
      sector: "عطور ومستحضرات",
      sectorSlug: "perfume",
      purpose: "collaborate",
      purposeLabel: "أتعاون (أعمال وتوريد واستثمار)",
      visitorId: "usr-visitor-demo",
      visitorName: "خالد التميمي",
      visitorEmail: "khaled@tamimi-trading.com",
      visitorPhone: "+966504455667",
      groupDetails: {
        entityName: "مجموعة التميمي للتجارة والتوزيع",
        domain: "قطاع التجزئة ومستحضرات العناية الفاخرة",
        meetingSubject: "بحث عقد توريد سنوي لدهن الورد الطائفي الصافي وماء الورد لخطوط منتجات فندقية راقية."
      },
      requestedDate: "2026-10-22",
      requestedSlotTime: "10:30 ص",
      excitedAbout: "معاينة معمل التعتيق وقوارير التلقية النحاسية ومناقشة القدرة الإنتاجية الشهرية.",
      status: "confirmed",
      createdAt: "2026-09-24T09:00:00Z",
      confirmedAt: "2026-09-25T13:00:00Z",
      ticketPass: {
        passNumber: "PASS-NF-9921",
        gate: "بوابة كبار الزوار والوفود التجارية - مبنى الإدارة",
        arrivalWindow: "الوصول قبل 15 دقيقة (10:15 ص)",
        safetyNotes: "الرجاء إبراز الهوية الوطنية عند البوابة. يتوفر موقف مخصص للوفود.",
        qrMockText: "VALIDATED-VISIT-KAYFA-TOSNA-FAC-PERFUME-REQ-8803"
      },
      statusLog: [
        {
          status: "pending",
          timestamp: "2026-09-24T09:00:00Z",
          note: "إرسال طلب الزيارة لبحث التعاون التجاري."
        },
        {
          status: "confirmed",
          timestamp: "2026-09-25T13:00:00Z",
          note: "تمت موافقة إدارة دار نفحات وتأكيد الزيارة وإصدار تصريح الدخول."
        }
      ]
    },
    {
      id: "REQ-2026-8804",
      factoryId: "fac-ceramic",
      factoryName: "أتيليه ومسبك فخار وادي حنيفة",
      sector: "خزف وفنون صناعية",
      sectorSlug: "ceramic",
      purpose: "explore",
      purposeLabel: "أكتشف (أفراد وعائلات)",
      visitorId: "usr-visitor-demo",
      visitorName: "سلطان العبدالله",
      visitorEmail: "sultan@example.com",
      visitorPhone: "+966551234567",
      groupDetails: {
        attendeesCount: 2,
        adultsCount: 2,
        childrenCount: 0,
        ageRange: "كبار"
      },
      requestedDate: "2026-09-15",
      requestedSlotTime: "04:00 م",
      excitedAbout: "تجربة عجلات الخزف والتعرف على خلطة طين الدرعية.",
      status: "completed",
      createdAt: "2026-09-10T16:00:00Z",
      confirmedAt: "2026-09-11T10:00:00Z",
      completedAt: "2026-09-15T18:00:00Z",
      stampAwarded: true,
      reflectionNote: "زيارة مبهرة كشفت لنا أصالة حرفة الفخار في وادي حنيفة وروعة الأفران المتوهجة.",
      statusLog: [
        {
          status: "pending",
          timestamp: "2026-09-10T16:00:00Z",
          note: "تم إرسال الطلب."
        },
        {
          status: "confirmed",
          timestamp: "2026-09-11T10:00:00Z",
          note: "تم تأكيد الحجز."
        },
        {
          status: "completed",
          timestamp: "2026-09-15T18:00:00Z",
          note: "تم حضور الزيارة واكتمال الجولة بنجاح ومنح ختم قطاع الخزف في جواز الاكتشاف."
        }
      ]
    },
    {
      id: "REQ-2026-8805",
      factoryId: "fac-paper",
      factoryName: "مصنع تجديد لتقنيات الورق المستدام",
      sector: "تدوير وصناعات بيئية",
      sectorSlug: "paper",
      purpose: "explore",
      purposeLabel: "أكتشف (أفراد وعائلات)",
      visitorId: "usr-visitor-demo",
      visitorName: "سلطان العبدالله",
      visitorEmail: "sultan@example.com",
      visitorPhone: "+966551234567",
      groupDetails: {
        attendeesCount: 5,
        adultsCount: 2,
        childrenCount: 3,
        ageRange: "عائلة وأطفال دون 12 سنة"
      },
      requestedDate: "2026-09-08",
      requestedSlotTime: "09:00 ص",
      excitedAbout: "مشاهدة تدوير الورق والآلات الضخمة.",
      status: "rejected",
      rejectionReason: "نعتذر بشدة؛ متطلبات السلامة الميدانية للمصنع تمنع وجود أطفال دون 12 سنة لوجود روافع شوكية ثقيلة وأحواض إذابة مكشوفة. نرحب بكم في فعالياتنا المجتمعية المفتوحة القادمة.",
      createdAt: "2026-09-05T08:00:00Z",
      rejectedAt: "2026-09-06T11:00:00Z",
      statusLog: [
        {
          status: "pending",
          timestamp: "2026-09-05T08:00:00Z",
          note: "تم إرسال الطلب."
        },
        {
          status: "rejected",
          timestamp: "2026-09-06T11:00:00Z",
          note: "تم الاعتذار لتعارض شروط السلامة العمرية مع طبيعة خطوط الإنتاج."
        }
      ]
    }
  ],
  // Factory Onboarding Applications (سجّل مصنعك)
  onboardingApplications: [
    {
      id: "app-aroma-201",
      factoryName: "مصنع أروما للبتروكيماويات والبوليمرات الصديقة",
      sector: "صناعات متقدمة",
      city: "الجبيل الصناعية",
      contactName: "م. فيصل الشهري",
      phone: "+966506677889",
      email: "f.shehri@aroma-poly.sa",
      experienceSummary: "جولة تقنية في مصانع إنتاج البوليمرات الحيوية القابلة للتحلل العضوي المخصصة للعبوات الطبية.",
      capacityPerTour: 15,
      submittedAt: "2026-09-26T15:20:00Z",
      status: "pending_review", // pending_review, approved, rejected
      notes: "قيد فحص شروط السلامة والتصاريح البيئية قبل اعتماد النشر."
    }
  ],
  // In-app Notifications
  notifications: [
    {
      id: "notif-1",
      targetUser: "usr-visitor-demo",
      type: "status_update",
      title: "اقتراح موعد بديل من مصنع قطيفة",
      message: "اقترحت إدارة مصنع قطيفة موعدًا بديلًا لزيارة المدرسة في 14 أكتوبر 10:30 ص. يرجى مراجعة الطلب واتخاذ القرار.",
      linkTab: "visits",
      timestamp: "2026-09-27T14:30:00Z",
      read: false
    },
    {
      id: "notif-2",
      targetUser: "usr-visitor-demo",
      type: "confirmed",
      title: "تأكيد زيارة دار نفحات للعطور",
      message: "تهانينا! تم تأكيد موعد زيارتك لدار نفحات في 22 أكتوبر، وتصريح الدخول متاح الآن في بطاقة الزيارة.",
      linkTab: "visits",
      timestamp: "2026-09-25T13:00:00Z",
      read: true
    },
    {
      id: "notif-3",
      targetUser: "fac-coffee",
      type: "new_request",
      title: "طلب زيارة جديد #REQ-2026-8801",
      message: "تلقيت طلب زيارة استكشافية جديد لـ 4 أشخاص من سلطان العبدالله.",
      linkTab: "factory",
      timestamp: "2026-09-27T10:15:00Z",
      read: false
    }
  ]
};

class DataStore {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.data = JSON.parse(JSON.stringify(initialData));
        this.save();
      }
    } catch (err) {
      console.error('Failed to load DB, falling back to initial data:', err);
      this.data = JSON.parse(JSON.stringify(initialData));
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save DB to disk:', err);
    }
  }

  resetToSeed() {
    this.data = JSON.parse(JSON.stringify(initialData));
    this.save();
    return this.data;
  }

  // Factories
  getFactories(onlyPublished = true) {
    if (onlyPublished) {
      return this.data.factories.filter(f => f.status === 'published');
    }
    return this.data.factories;
  }

  getFactoryById(id) {
    return this.data.factories.find(f => f.id === id);
  }

  updateFactory(id, updates) {
    const idx = this.data.factories.findIndex(f => f.id === id);
    if (idx !== -1) {
      this.data.factories[idx] = { ...this.data.factories[idx], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return this.data.factories[idx];
    }
    return null;
  }

  toggleFactoryAccepting(id) {
    const factory = this.getFactoryById(id);
    if (factory) {
      factory.isAcceptingRequests = !factory.isAcceptingRequests;
      factory.updatedAt = new Date().toISOString();
      this.save();
      return factory;
    }
    return null;
  }

  // Events
  getEvents() {
    return this.data.events;
  }

  getEventById(id) {
    return this.data.events.find(e => e.id === id);
  }

  bookEvent(eventId, { visitorName, visitorEmail, visitorPhone, seats = 1 }) {
    const event = this.getEventById(eventId);
    if (!event) throw new Error('الفعالية غير موجودة');
    if (event.availableSeats < seats) throw new Error('المقاعد المتبقية لا تكفي لهذا العدد');

    // Duplicate check
    const existing = event.attendees.find(a => a.email.toLowerCase() === visitorEmail.toLowerCase());
    if (existing) throw new Error('تم التسجيل مسبقًا في هذه الفعالية بهذا البريد الإلكتروني');

    event.attendees.push({
      id: 'att-' + Date.now(),
      name: visitorName,
      email: visitorEmail,
      phone: visitorPhone,
      seats: Number(seats),
      bookedAt: new Date().toISOString()
    });

    event.bookedSeats = Number(event.bookedSeats) + Number(seats);
    event.availableSeats = Math.max(0, Number(event.totalSeats) - Number(event.bookedSeats));
    this.save();
    return event;
  }

  createEvent(factoryId, eventData) {
    const factory = this.getFactoryById(factoryId);
    if (!factory) throw new Error('المصنع غير موجود');

    const newEvent = {
      id: 'evt-' + Date.now(),
      factoryId,
      factoryName: factory.name,
      title: eventData.title,
      date: eventData.date,
      time: eventData.time,
      dateText: eventData.dateText || eventData.date,
      totalSeats: Number(eventData.totalSeats) || 15,
      bookedSeats: 0,
      availableSeats: Number(eventData.totalSeats) || 15,
      fee: eventData.fee || 'مجانية',
      description: eventData.description,
      status: 'active',
      attendees: []
    };

    this.data.events.push(newEvent);
    this.save();
    return newEvent;
  }

  // Visit Requests
  getRequests(filter = {}) {
    let list = this.data.requests;
    if (filter.visitorId) {
      list = list.filter(r => r.visitorId === filter.visitorId || r.visitorEmail === filter.visitorEmail);
    }
    if (filter.factoryId) {
      list = list.filter(r => r.factoryId === filter.factoryId);
    }
    if (filter.status) {
      list = list.filter(r => r.status === filter.status);
    }
    return list;
  }

  getRequestById(id) {
    return this.data.requests.find(r => r.id === id);
  }

  createRequest(reqData) {
    const factory = this.getFactoryById(reqData.factoryId);
    if (!factory) throw new Error('المصنع المحدد غير موجود');
    if (!factory.isAcceptingRequests) throw new Error('المصنع متوقف حاليًا عن استقبال طلبات الزيارة الجديدة');

    // Generate Request ID
    const count = this.data.requests.length + 8801;
    const id = `REQ-2026-${count}`;

    const newReq = {
      id,
      factoryId: factory.id,
      factoryName: factory.name,
      sector: factory.sector,
      sectorSlug: factory.sectorSlug,
      purpose: reqData.purpose, // explore, learn, collaborate
      purposeLabel: reqData.purposeLabel || (reqData.purpose === 'explore' ? 'أكتشف (أفراد وعائلات)' : reqData.purpose === 'learn' ? 'أتعلّم (مؤسسات تعليمية وفرق)' : 'أتعاون (أعمال واستثمار)'),
      visitorId: reqData.visitorId || 'usr-visitor-demo',
      visitorName: reqData.visitorName,
      visitorEmail: reqData.visitorEmail,
      visitorPhone: reqData.visitorPhone,
      groupDetails: reqData.groupDetails || {},
      requestedDate: reqData.requestedDate,
      requestedSlotTime: reqData.requestedSlotTime,
      excitedAbout: reqData.excitedAbout || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      statusLog: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: 'تم إرسال طلب الزيارة بنجاح وهو بانتظار مراجعة إدارة المصنع.'
        }
      ]
    };

    this.data.requests.unshift(newReq);

    // Add In-App notification for the factory
    this.addNotification({
      targetUser: factory.id,
      type: 'new_request',
      title: `طلب زيارة جديد #${newReq.id}`,
      message: `تلقيت طلب زيارة من ${newReq.visitorName} لـ ${newReq.groupDetails.attendeesCount || newReq.groupDetails.studentsCount || 'مجموعة'}.`,
      linkTab: 'factory'
    });

    this.save();
    return newReq;
  }

  // Factory actions on requests
  updateRequestStatus(requestId, factoryId, action, payload = {}) {
    const req = this.getRequestById(requestId);
    if (!req) throw new Error('الطلب غير موجود');
    if (req.factoryId !== factoryId) throw new Error('غير مصرح لك بإدارة هذا الطلب');

    const now = new Date().toISOString();

    if (action === 'confirm') {
      req.status = 'confirmed';
      req.confirmedAt = now;
      req.ticketPass = {
        passNumber: `PASS-${req.sectorSlug.toUpperCase().slice(0, 2)}-${Math.floor(1000 + Math.random() * 9000)}`,
        gate: payload.gate || 'البوابة الرئيسية لاستقبال الزوار والوفود',
        arrivalWindow: payload.arrivalWindow || 'يرجى الحضور قبل الموعد بـ 15 دقيقة',
        safetyNotes: payload.safetyNotes || 'الرجاء الالتزام بتعليمات المشرف الميداني وارتداء الملابس المناسبة',
        qrMockText: `VALIDATED-${req.id}-${req.factoryId}`
      };
      req.statusLog.push({
        status: 'confirmed',
        timestamp: now,
        note: payload.note || 'تمت موافقة إدارة المصنع وتأكيد الموعد وإصدار تصريح الزيارة.'
      });

      this.addNotification({
        targetUser: req.visitorId,
        type: 'confirmed',
        title: `تأكيد زيارة ${req.factoryName}`,
        message: `تهانينا! وافقت إدارة المصنع على زيارتك #${req.id}. بطاقة الدخول متاحة الآن في زياراتك.`,
        linkTab: 'visits'
      });
    } else if (action === 'propose_alternative') {
      if (!payload.alternativeDate || !payload.alternativeTime) {
        throw new Error('يرجى تحديد التاريخ والوقت البديل المقترح');
      }
      req.status = 'alternative_proposed';
      req.proposedAlternative = {
        date: payload.alternativeDate,
        time: payload.alternativeTime,
        reason: payload.reason || 'الموعد البديل الأنسب لتشغيل خطوط الإنتاج وتقديم تجربة مثالية.',
        proposedAt: now
      };
      req.statusLog.push({
        status: 'alternative_proposed',
        timestamp: now,
        note: `اقترح المصنع موعدًا بديلًا (${payload.alternativeDate} الساعة ${payload.alternativeTime}): ${payload.reason || ''}`
      });

      this.addNotification({
        targetUser: req.visitorId,
        type: 'status_update',
        title: `موعد بديل مقترح من ${req.factoryName}`,
        message: `يقترح المصنع موعدًا جديدًا لطلبك #${req.id} بتاريخ ${payload.alternativeDate}. بانتظار قرارك.`,
        linkTab: 'visits'
      });
    } else if (action === 'reject') {
      req.status = 'rejected';
      req.rejectedAt = now;
      req.rejectionReason = payload.reason || 'نعتذر عن عدم إمكانية استقبال الزيارة في الفترة الحالية لظروف تشغيلية.';
      req.statusLog.push({
        status: 'rejected',
        timestamp: now,
        note: `تم الاعتذار عن الطلب: ${req.rejectionReason}`
      });

      this.addNotification({
        targetUser: req.visitorId,
        type: 'status_update',
        title: `تحديث بخصوص طلبك لـ ${req.factoryName}`,
        message: `تم الاعتذار عن طلب الزيارة #${req.id}: ${req.rejectionReason}`,
        linkTab: 'visits'
      });
    } else if (action === 'complete') {
      req.status = 'completed';
      req.completedAt = now;
      req.stampAwarded = true;
      req.statusLog.push({
        status: 'completed',
        timestamp: now,
        note: 'تم تسجيل حضور الزائر واكتمال الجولة بنجاح، ومُنح ختم القطاع في جواز الاكتشاف.'
      });

      this.addNotification({
        targetUser: req.visitorId,
        type: 'stamp_awarded',
        title: `ختم جديد في جواز الاكتشاف! 🎖️`,
        message: `سجّل ${req.factoryName} اكتمال زيارتك بنجاح. أضيف ختم قطاع (${req.sector}) إلى جوازك!`,
        linkTab: 'passport'
      });
    }

    this.save();
    return req;
  }

  // Visitor responses to proposed alternative
  visitorRespondToAlternative(requestId, visitorId, accept, visitorNote = '') {
    const req = this.getRequestById(requestId);
    if (!req) throw new Error('الطلب غير موجود');
    if (req.status !== 'alternative_proposed') throw new Error('هذا الطلب ليس بانتظار رد على موعد بديل');

    const now = new Date().toISOString();

    if (accept) {
      req.status = 'confirmed';
      req.requestedDate = req.proposedAlternative.date;
      req.requestedSlotTime = req.proposedAlternative.time;
      req.confirmedAt = now;
      req.ticketPass = {
        passNumber: `PASS-${req.sectorSlug.toUpperCase().slice(0, 2)}-${Math.floor(1000 + Math.random() * 9000)}`,
        gate: 'البوابة الرئيسية لاستقبال الزوار',
        arrivalWindow: 'يرجى الحضور قبل الموعد بـ 15 دقيقة',
        safetyNotes: 'تم تأكيد الموعد البديل المقترح. نرجو إبراز بطاقة الدخول عند البوابة.',
        qrMockText: `VALIDATED-${req.id}-${req.factoryId}`
      };
      req.statusLog.push({
        status: 'confirmed',
        timestamp: now,
        note: `وافق الزائر على الموعد البديل المقترح (${req.requestedDate} ${req.requestedSlotTime}). أصبحت الزيارة مؤكدة وتم إصدار التصريح.`
      });

      this.addNotification({
        targetUser: req.factoryId,
        type: 'status_update',
        title: `قبول الموعد البديل للطلب #${req.id}`,
        message: `وافق الزائر ${req.visitorName} على الموعد البديل المقترح (${req.requestedDate}). أصبحت الزيارة مؤكدة.`,
        linkTab: 'factory'
      });
    } else {
      req.status = 'cancelled';
      req.cancelledAt = now;
      req.statusLog.push({
        status: 'cancelled',
        timestamp: now,
        note: `اعتذر الزائر عن قبول الموعد البديل المقترح وألغي الطلب: ${visitorNote || 'الموعد لا يناسب جدول الزائر'}.`
      });

      this.addNotification({
        targetUser: req.factoryId,
        type: 'status_update',
        title: `إلغاء الطلب #${req.id}`,
        message: `اعتذر الزائر ${req.visitorName} عن الموعد البديل وألغي الطلب.`,
        linkTab: 'factory'
      });
    }

    this.save();
    return req;
  }

  // Passport (calculated strictly from completed visits)
  getPassport(visitorId) {
    const sectors = [
      { slug: "coffee", name: "قطاع القهوة والمشروبات", icon: "☕", badge: "خبير التحميص" },
      { slug: "chocolate", name: "قطاع الشوكولاتة والحلويات", icon: "🍫", badge: "حرفي الكاكاو" },
      { slug: "perfume", name: "قطاع العطور والتقطير", icon: "🌸", badge: "مستكشف النوتات" },
      { slug: "ceramic", name: "قطاع الخزف والفخار", icon: "🏺", badge: "صانع الطين" },
      { slug: "paper", name: "قطاع الورق والتدوير", icon: "♻️", badge: "حامي الاستدامة" }
    ];

    const completedVisits = this.data.requests.filter(
      r => (r.visitorId === visitorId || r.visitorEmail === 'sultan@example.com') && r.status === 'completed'
    );

    const stamps = sectors.map(sec => {
      const visit = completedVisits.find(v => v.sectorSlug === sec.slug);
      return {
        ...sec,
        isUnlocked: Boolean(visit),
        awardedAt: visit ? visit.completedAt : null,
        factoryName: visit ? visit.factoryName : null,
        reflectionNote: visit ? visit.reflectionNote : null,
        requestId: visit ? visit.id : null
      };
    });

    const unlockedCount = stamps.filter(s => s.isUnlocked).length;

    return {
      visitorId,
      stamps,
      totalSectors: sectors.length,
      unlockedCount,
      progressPercentage: Math.round((unlockedCount / sectors.length) * 100),
      completedVisits
    };
  }

  // Onboarding (سجل مصنعك)
  createOnboarding(appData) {
    const newApp = {
      id: 'app-' + Date.now(),
      factoryName: appData.factoryName,
      sector: appData.sector,
      city: appData.city,
      contactName: appData.contactName,
      phone: appData.phone,
      email: appData.email,
      experienceSummary: appData.experienceSummary,
      capacityPerTour: Number(appData.capacityPerTour) || 15,
      submittedAt: new Date().toISOString(),
      status: 'pending_review',
      notes: appData.notes || 'طلب جديد بانتظار مراجعة إدارة المنصة والتواصل للتحقق الميداني.'
    };
    this.data.onboardingApplications.unshift(newApp);

    // Add In-App notification for Admin
    this.addNotification({
      targetUser: 'admin',
      type: 'new_onboarding',
      title: `طلب انضمام مصنع جديد: ${newApp.factoryName}`,
      message: `تم تقديم طلب تسجيل مصنع جديد في قطاع (${newApp.sector}) بمدينة ${newApp.city}.`,
      linkTab: 'admin'
    });

    this.save();
    return newApp;
  }

  getOnboardingApplications() {
    return this.data.onboardingApplications;
  }

  reviewOnboarding(appId, approve, note = '') {
    const app = this.data.onboardingApplications.find(a => a.id === appId);
    if (!app) throw new Error('طلب التسجيل غير موجود');

    const now = new Date().toISOString();
    if (approve) {
      app.status = 'approved';
      app.approvedAt = now;
      app.reviewNote = note || 'تم التحقق من جاهزية المصنع ومطابقة معايير الزوار واعتماد النشر المبدئي.';

      // Add as draft or new factory into factories collection
      const newFactoryId = 'fac-' + Date.now();
      const newFactory = {
        id: newFactoryId,
        name: app.factoryName,
        tagline: 'منشأة صناعية وطنية معتمدة',
        sector: app.sector,
        sectorSlug: 'general',
        sectorColor: '#3B7A75',
        sectorIcon: 'building',
        city: app.city,
        district: 'المنطقة الصناعية',
        established: '2023',
        description: app.experienceSummary,
        story: 'انضم هذا المصنع حديثًا إلى شبكة منصة «كيف تُصنع؟» لفتح أبوابه أمام الزوار والمهتمين بالصناعات الوطنية.',
        coverImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1000&auto=format&fit=crop&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
        ],
        isAcceptingRequests: true,
        status: 'published',
        isDemo: true,
        products: [
          {
            name: 'خط الإنتاج الأساسي',
            desc: 'أحدث التقنيات المصنعة بمواصفات قياسية وطنية.',
            image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&fit=crop&q=80',
            tag: 'منتج معتمد'
          }
        ],
        tourExperience: {
          title: `جولة تعريفية في مرافق ${app.factoryName}`,
          overview: app.experienceSummary,
          duration: '60 دقيقة',
          capacity: app.capacityPerTour || 15,
          acceptedPurposes: ['explore', 'learn', 'collaborate'],
          targetGroups: ['المهتمون بالصناعة والفرق المتخصصة'],
          requirements: [
            'الالتزام بإرشادات السلامة وارتداء السترة الواقية',
            'إبراز الهوية الوطنية عند مدخل المنشأة'
          ],
          arrivalInstructions: 'بوابة الاستقبال الإداري.'
        },
        stations: [
          {
            id: 'st-' + Date.now() + '-1',
            order: 1,
            title: 'خط الاستقبال والمعاينة الأولية',
            shortDesc: 'استقبال الوفد والتعريف بتاريخ المنشأة وإجراءات السلامة.',
            fullDesc: 'محطة تعريفية بالهيكل الصناعي وإجراءات السلامة العامة المتبعة في صالات العمل.',
            photo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80'
          },
          {
            id: 'st-' + Date.now() + '-2',
            order: 2,
            title: 'عنبر التصنيع والتحكم الرقمي',
            shortDesc: 'مشاهدة مراحل الإنتاج الآلي ومراقبة الجودة.',
            fullDesc: 'جولة داخل صالة التصنيع الرئيسية لمتابعة تدفق المنتجات عبر خطوط المعالجة الآلية.',
            photo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'
          }
        ],
        regularSlots: [
          { id: 'slot-new-1', day: 'الثلاثاء', time: '10:00 ص', dateRange: 'أسبوعيًا', maxCapacity: app.capacityPerTour || 15 }
        ],
        blackoutDates: [],
        managerAccount: {
          username: 'fac_mgr_' + newFactoryId.slice(4),
          displayName: app.contactName,
          phone: app.phone,
          email: app.email
        }
      };

      this.data.factories.push(newFactory);
    } else {
      app.status = 'rejected';
      app.rejectedAt = now;
      app.reviewNote = note || 'لم يستوفِ الملف متطلبات السلامة أو مسار الزوار المعتمد في الوقت الحالي.';
    }

    this.save();
    return app;
  }

  // Notifications
  getNotifications(targetUser) {
    if (!targetUser) return this.data.notifications;
    return this.data.notifications.filter(n => n.targetUser === targetUser || n.targetUser === 'all');
  }

  addNotification(notif) {
    const item = {
      id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 100),
      targetUser: notif.targetUser,
      type: notif.type || 'info',
      title: notif.title,
      message: notif.message,
      linkTab: notif.linkTab || '',
      timestamp: new Date().toISOString(),
      read: false
    };
    this.data.notifications.unshift(item);
    if (this.data.notifications.length > 50) {
      this.data.notifications.pop();
    }
    this.save();
    return item;
  }

  markNotificationRead(id) {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
    }
  }

  // Metrics summary for admin
  getAdminMetrics() {
    const totalFactories = this.data.factories.length;
    const activeFactories = this.data.factories.filter(f => f.status === 'published' && f.isAcceptingRequests).length;
    const pendingOnboarding = this.data.onboardingApplications.filter(a => a.status === 'pending_review').length;
    const totalRequests = this.data.requests.length;
    const confirmedVisits = this.data.requests.filter(r => r.status === 'confirmed').length;
    const completedVisits = this.data.requests.filter(r => r.status === 'completed').length;
    const totalVisitors = this.data.requests.reduce((sum, r) => {
      const attendees = Number(r.groupDetails?.attendeesCount) || Number(r.groupDetails?.studentsCount) || 1;
      return sum + attendees;
    }, 0);

    return {
      totalFactories,
      activeFactories,
      pendingOnboarding,
      totalRequests,
      confirmedVisits,
      completedVisits,
      totalVisitors
    };
  }
}

const store = new DataStore();
module.exports = store;

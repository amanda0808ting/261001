//// 儲存所有氣球。
let balloons = [];

// 儲存爆破粒子。
let particles = [];

// 儲存音效控制按鈕。
let soundButton = null;

// 儲存 Web Audio API 音效環境。
let audioContext = null;

// 設定音效是否開啟。
let soundEnabled = true;

// 設定畫布背景顏色。
const BACKGROUND_COLOR = '#bde0fe';

// 設定氣球顏色清單。
const BALLOON_COLORS = [
  '#cdb4db',
  '#ffc8dd',
  '#ffafcc',
  '#bde0fe',
  '#a2d2ff'
];

// 設定氣球數量。
const BALLOON_COUNT = 25;

// 設定氣球最小尺寸。
const MIN_BALLOON_SIZE = 150;

// 設定氣球最大尺寸。
const MAX_BALLOON_SIZE = 250;

// 設定氣球最小速度。
const MIN_BALLOON_SPEED = 3;

// 設定氣球最大速度。
const MAX_BALLOON_SPEED = 8;

// 設定氣球透明度。
const BALLOON_ALPHA = 85;

// 設定兩輪爆破開始之間的間隔。
const BURST_INTERVAL = 2000;

// 設定第一次爆破最多等待的時間。
const FIRST_BURST_DELAY = 1000;

// 設定目前是否正在依序爆破氣球。
let isBursting = false;

// 設定下一輪爆破允許開始的時間。
let nextBurstTime = 0;

// 設定畫布中央附近的判定寬度。
const CENTER_TOLERANCE = 12;

// 建立全螢幕畫布。
function setup() {
  // 建立符合瀏覽器視窗大小的畫布。
  createCanvas(windowWidth, windowHeight);

  // 設定初始氣球。
  createInitialBalloons();

  // 建立音效開關按鈕。
  createSoundButton();

  // 設定第一次爆破時間，確保 2 秒內會嘗試爆破。
  nextBurstTime = millis() + FIRST_BURST_DELAY;
}

// 每一幀執行遊戲畫面。
function draw() {
  // 填滿淺藍色背景。
  background(BACKGROUND_COLOR);

  // 更新並繪製氣球。
  updateAndDrawBalloons();

  // 更新並繪製爆破粒子。
  updateAndDrawParticles();

  // 檢查是否有氣球到達畫布中央。
  checkBurst();
}

// 建立初始的 25 顆氣球。
function createInitialBalloons() {
  // 清空原本的氣球陣列。
  balloons = [];

  // 依照指定數量建立氣球。
  for (let i = 0; i < BALLOON_COUNT; i++) {
    // 將氣球放在畫布內或畫布下方。
    balloons.push(
      createBalloon(
        random(width),
        random(-height, height + 350)
      )
    );
  }
}

// 建立音效控制按鈕。
function createSoundButton() {
  // 建立音效按鈕。
  soundButton = createButton('音效：開啟');

  // 設定按鈕的點擊事件。
  soundButton.mousePressed(toggleSound);

  // 設定按鈕的位置。
  soundButton.position(20, 20);

  // 設定按鈕文字大小。
  soundButton.style('font-size', '16px');

  // 設定按鈕內距。
  soundButton.style('padding', '10px 16px');

  // 設定按鈕圓角。
  soundButton.style('border-radius', '8px');

  // 移除按鈕邊框。
  soundButton.style('border', 'none');

  // 設定按鈕背景顏色。
  soundButton.style('background', '#ffffff');

  // 設定按鈕文字顏色。
  soundButton.style('color', '#4f5275');

  // 設定按鈕游標樣式。
  soundButton.style('cursor', 'pointer');

  // 讓按鈕顯示在畫布上方。
  soundButton.style('z-index', '10');
}

// 切換音效開關。
function toggleSound() {
  // 切換音效開啟狀態。
  soundEnabled = !soundEnabled;

  // 更新按鈕文字。
  soundButton.html(soundEnabled ? '音效：開啟' : '音效：關閉');

  // 如果開啟音效，就啟動音效環境。
  if (soundEnabled) {
    // 啟動音效環境。
    startAudio();
  }
}

// 建立一顆氣球。
function createBalloon(x, y) {
  // 隨機產生氣球大小。
  const size = random(MIN_BALLOON_SIZE, MAX_BALLOON_SIZE);

  // 回傳氣球物件。
  return {
    // 設定氣球水平位置。
    x: x,

    // 設定氣球垂直位置。
    y: y,

    // 設定氣球寬度。
    width: size * 0.78,

    // 設定氣球高度。
    height: size,

    // 設定氣球上飄速度。
    speed: random(MIN_BALLOON_SPEED, MAX_BALLOON_SPEED),

    // 隨機選擇氣球顏色。
    color: random(BALLOON_COLORS),

    // 設定氣球左右晃動的相位。
    phase: random(TWO_PI),

    // 設定氣球左右晃動的幅度。
    swayAmount: random(8, 22),

    // 設定氣球是否已經標記為爆破。
    marked: false
  };
}

// 更新並繪製所有氣球。
function updateAndDrawBalloons() {
  // 從陣列最後一顆氣球往前處理。
  for (let i = balloons.length - 1; i >= 0; i--) {
    // 取得目前氣球。
    const balloon = balloons[i];

    // 讓氣球向上飄動。
    balloon.y -= balloon.speed;

    // 讓氣球左右輕微晃動。
    balloon.x += sin(frameCount * 0.025 + balloon.phase) * 0.45;

    // 繪製氣球。
    drawBalloon(balloon);

    // 判斷氣球是否已經完全飄出畫布上方。
    if (balloon.y + balloon.height * 0.6 < 0) {
      // 從陣列移除已離開畫面的氣球。
      balloons.splice(i, 1);

      // 從畫布下方建立新的氣球。
      balloons.push(
        createBalloon(
          random(width),
          height + random(80, 350)
        )
      );
    }
  }

  // 如果氣球數量不足，就補回 25 顆。
  while (balloons.length < BALLOON_COUNT) {
    // 從畫布下方補充新的氣球。
    balloons.push(
      createBalloon(
        random(width),
        height + random(80, 350)
      )
    );
  }
}

// 繪製單一氣球。
function drawBalloon(balloon) {
  // 儲存目前繪圖設定。
  push();

  // 計算氣球左右晃動後的水平位置。
  const swayX =
    sin(frameCount * 0.025 + balloon.phase) *
    balloon.swayAmount;

  // 移動畫布原點到氣球位置。
  translate(balloon.x + swayX, balloon.y);

  // 關閉外框線。
  noStroke();

  // 建立氣球顏色。
  const balloonColor = color(balloon.color);

  // 設定氣球透明度為 85。
  balloonColor.setAlpha(BALLOON_ALPHA);

  // 使用透明顏色填滿氣球。
  fill(balloonColor);

  // 繪製氣球本體。
  ellipse(0, 0, balloon.width, balloon.height);

  // 建立氣球底部結點顏色。
  const knotColor = color(balloon.color);

  // 設定結點透明度為 85。
  knotColor.setAlpha(BALLOON_ALPHA);

  // 使用透明顏色填滿結點。
  fill(knotColor);

  // 繪製氣球底部結點。
  triangle(
    -balloon.width * 0.07,
    balloon.height * 0.43,
    balloon.width * 0.07,
    balloon.height * 0.43,
    0,
    balloon.height * 0.53
  );

  // 設定氣球繩子顏色。
  stroke(255, 150);

  // 設定氣球繩子粗細。
  strokeWeight(2);

  // 繪製氣球繩子。
  line(
    0,
    balloon.height * 0.51,
    sin(frameCount * 0.02 + balloon.phase) * 8,
    balloon.height * 0.82
  );

  // 關閉星星外框線。
  noStroke();

  // 設定星星顏色。
  fill(255, 220);

  // 繪製氣球右上角星星。
  drawStar(
    balloon.width * 0.22,
    -balloon.height * 0.22,
    balloon.width * 0.06,
    balloon.width * 0.13
  );

  // 恢復原本的繪圖設定。
  pop();
}

// 繪製五角星。
function drawStar(x, y, innerRadius, outerRadius) {
  // 開始建立星星形狀。
  beginShape();

  // 建立五角星的十個交錯頂點。
  for (let i = 0; i < 10; i++) {
    // 計算目前頂點的角度。
    const angle = -HALF_PI + (i * PI) / 5;

    // 奇數頂點使用內半徑，偶數頂點使用外半徑。
    const radius =
      i % 2 === 0 ? outerRadius : innerRadius;

    // 加入星星頂點。
    vertex(
      x + cos(angle) * radius,
      y + sin(angle) * radius
    );
  }

  // 關閉星星形狀。
  endShape(CLOSE);
}

// 檢查是否有氣球到達畫布中央。
function checkBurst() {
  // 如果正在依序爆破，就不開始新的爆破。
  if (isBursting) {
    // 結束本次檢查。
    return;
  }

  // 如果還沒到下一次爆破時間，就結束檢查。
  if (millis() < nextBurstTime) {
    // 結束本次檢查。
    return;
  }

  // 計算畫布正中央的垂直座標。
  const centerY = height / 2;

  // 尋找已經到達畫布中央的氣球。
  const candidates = balloons.filter(function (balloon) {
    // 計算氣球是否已經到達中央。
    const reachedCenter =
      balloon.y <= centerY + CENTER_TOLERANCE;

    // 回傳已到達中央且尚未標記的氣球。
    return reachedCenter && !balloon.marked;
  });

  // 如果目前沒有至少兩顆氣球到達中央，就稍後再檢查。
  if (candidates.length < 2) {
    // 每 100 毫秒檢查一次，確保氣球到達中央就能爆破。
    nextBurstTime = millis() + 100;

    // 結束本次檢查。
    return;
  }

  // 將候選氣球隨機排序。
  shuffleArray(candidates);

  // 隨機決定本次爆破 2 或 3 顆氣球。
  const burstCount = min(
    floor(random(2, 4)),
    candidates.length
  );

  // 標記本次要爆破的氣球。
  for (let i = 0; i < burstCount; i++) {
    // 將氣球標記為即將爆破。
    candidates[i].marked = true;
  }

  // 依序爆破選中的氣球。
  burstSequentially(
    candidates.slice(0, burstCount)
  );
}

// 依序爆破氣球，避免同時爆破。
function burstSequentially(targets) {
  // 設定目前正在進行爆破。
  isBursting = true;

  // 建立依序爆破函式。
  function burstOne(index) {
    // 判斷是否已經完成所有爆破。
    if (index >= targets.length) {
      // 結束目前爆破狀態。
      isBursting = false;

      // 設定下一次爆破時間為 2 秒後。
      nextBurstTime = millis() + BURST_INTERVAL;

      // 結束依序爆破流程。
      return;
    }

    // 取得目前要爆破的氣球。
    const balloon = targets[index];

    // 尋找氣球在陣列中的位置。
    const balloonIndex = balloons.indexOf(balloon);

    // 確認氣球仍然存在於陣列中。
    if (balloonIndex !== -1) {
      // 建立爆破粒子效果。
      createBurstParticles(balloon);

      // 播放爆裂音效。
      playBurstSound();

      // 從陣列移除爆破氣球。
      balloons.splice(balloonIndex, 1);

      // 從畫布下方補充新的氣球。
      balloons.push(
        createBalloon(
          random(width),
          height + random(80, 350)
        )
      );
    }

    // 延遲後爆破下一顆氣球。
    setTimeout(function () {
      // 爆破下一顆氣球。
      burstOne(index + 1);
    }, 350);
  }

  // 開始爆破第一顆氣球。
  burstOne(0);
}

// 建立爆破粒子。
function createBurstParticles(balloon) {
  // 計算氣球實際的水平位置。
  const burstX =
    balloon.x +
    sin(frameCount * 0.025 + balloon.phase) *
    balloon.swayAmount;

  // 取得氣球實際的垂直位置。
  const burstY = balloon.y;

  // 建立彩色爆破碎片。
  for (let i = 0; i < 32; i++) {
    // 隨機產生粒子方向。
    const angle = random(TWO_PI);

    // 隨機產生粒子速度。
    const speed = random(3, 11);

    // 將粒子加入陣列。
    particles.push({
      // 設定粒子水平位置。
      x: burstX,

      // 設定粒子垂直位置。
      y: burstY,

      // 設定粒子水平速度。
      vx: cos(angle) * speed,

      // 設定粒子垂直速度。
      vy: sin(angle) * speed,

      // 設定粒子透明度。
      alpha: 255,

      // 設定粒子大小。
      size: random(5, 15),

      // 設定粒子顏色。
      color: balloon.color
    });
  }

  // 建立白色閃光粒子。
  for (let i = 0; i < 8; i++) {
    // 隨機產生閃光方向。
    const angle = random(TWO_PI);

    // 將閃光粒子加入陣列。
    particles.push({
      // 設定粒子水平位置。
      x: burstX,

      // 設定粒子垂直位置。
      y: burstY,

      // 設定粒子水平速度。
      vx: cos(angle) * random(4, 9),

      // 設定粒子垂直速度。
      vy: sin(angle) * random(4, 9),

      // 設定粒子透明度。
      alpha: 255,

      // 設定粒子大小。
      size: random(8, 18),

      // 設定粒子顏色為白色。
      color: '#ffffff'
    });
  }
}

// 更新並繪製爆破粒子。
function updateAndDrawParticles() {
  // 從陣列尾端往前處理粒子。
  for (let i = particles.length - 1; i >= 0; i--) {
    // 取得目前粒子。
    const particle = particles[i];

    // 更新粒子水平位置。
    particle.x += particle.vx;

    // 更新粒子垂直位置。
    particle.y += particle.vy;

    // 加入重力效果。
    particle.vy += 0.14;

    // 讓粒子逐漸消失。
    particle.alpha -= 8;

    // 儲存目前繪圖設定。
    push();

    // 建立粒子顏色。
    const particleColor = color(particle.color);

    // 設定粒子透明度。
    particleColor.setAlpha(
      max(particle.alpha, 0)
    );

    // 使用粒子顏色填滿。
    fill(particleColor);

    // 關閉粒子外框線。
    noStroke();

    // 繪製粒子。
    ellipse(
      particle.x,
      particle.y,
      particle.size,
      particle.size
    );

    // 恢復繪圖設定。
    pop();

    // 判斷粒子是否已經完全消失。
    if (particle.alpha <= 0) {
      // 從陣列移除粒子。
      particles.splice(i, 1);
    }
  }
}

// 播放氣球爆裂音效。
function playBurstSound() {
  // 如果音效關閉，就不播放聲音。
  if (!soundEnabled) {
    // 結束音效函式。
    return;
  }

  // 啟動音效環境。
  startAudio();

  // 如果音效環境不存在，就結束函式。
  if (!audioContext) {
    // 結束音效函式。
    return;
  }

  // 建立白噪音緩衝區。
  const noiseBuffer = audioContext.createBuffer(
    1,
    audioContext.sampleRate * 0.22,
    audioContext.sampleRate
  );

  // 取得白噪音資料陣列。
  const noiseData = noiseBuffer.getChannelData(0);

  // 產生逐漸衰減的爆裂雜訊。
  for (let i = 0; i < noiseData.length; i++) {
    // 計算目前聲音的衰減比例。
    const decay = 1 - i / noiseData.length;

    // 寫入隨機白噪音。
    noiseData[i] =
      (Math.random() * 2 - 1) * decay;
  }

  // 建立白噪音播放器。
  const noiseSource = audioContext.createBufferSource();

  // 指定白噪音緩衝區。
  noiseSource.buffer = noiseBuffer;

  // 建立低通濾波器。
  const filter = audioContext.createBiquadFilter();

  // 設定濾波器類型。
  filter.type = 'lowpass';

  // 設定濾波器頻率。
  filter.frequency.setValueAtTime(
    1800,
    audioContext.currentTime
  );

  // 建立白噪音音量控制器。
  const noiseGain = audioContext.createGain();

  // 設定白噪音音量。
  noiseGain.gain.setValueAtTime(
    0.9,
    audioContext.currentTime
  );

  // 讓白噪音快速衰減。
  noiseGain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 0.22
  );

  // 將白噪音連接到濾波器。
  noiseSource.connect(filter);

  // 將濾波器連接到音量控制器。
  filter.connect(noiseGain);

  // 將音量控制器連接到喇叭。
  noiseGain.connect(audioContext.destination);

  // 建立低沉爆裂聲振盪器。
  const oscillator = audioContext.createOscillator();

  // 建立低沉聲音量控制器。
  const oscillatorGain = audioContext.createGain();

  // 設定振盪器波形。
  oscillator.type = 'sine';

  // 設定振盪器初始頻率。
  oscillator.frequency.setValueAtTime(
    150,
    audioContext.currentTime
  );

  // 讓頻率快速下降，形成爆裂感。
  oscillator.frequency.exponentialRampToValueAtTime(
    45,
    audioContext.currentTime + 0.18
  );

  // 設定低沉聲音量。
  oscillatorGain.gain.setValueAtTime(
    0.8,
    audioContext.currentTime
  );

  // 讓低沉聲快速衰減。
  oscillatorGain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 0.18
  );

  // 將振盪器連接到音量控制器。
  oscillator.connect(oscillatorGain);

  // 將音量控制器連接到喇叭。
  oscillatorGain.connect(audioContext.destination);

  // 開始播放白噪音。
  noiseSource.start();

  // 開始播放低沉爆裂聲。
  oscillator.start();

  // 設定白噪音停止時間。
  noiseSource.stop(
    audioContext.currentTime + 0.23
  );

  // 設定低沉爆裂聲停止時間。
  oscillator.stop(
    audioContext.currentTime + 0.19
  );
}

// 啟動 Web Audio API 音效環境。
function startAudio() {
  // 取得瀏覽器支援的音效環境類別。
  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext;

  // 如果瀏覽器不支援音效，就結束函式。
  if (!AudioContextClass) {
    // 結束函式。
    return;
  }

  // 如果音效環境尚未建立，就建立一個。
  if (!audioContext) {
    // 建立音效環境。
    audioContext = new AudioContextClass();
  }

  // 如果音效環境處於暫停狀態，就恢復播放。
  if (audioContext.state === 'suspended') {
    // 恢復音效環境。
    audioContext.resume();
  }
}

// 將陣列內容隨機排序。
function shuffleArray(array) {
  // 從陣列最後一項往前處理。
  for (let i = array.length - 1; i > 0; i--) {
    // 隨機選擇交換位置。
    const j = floor(random(i + 1));

    // 暫存目前元素。
    const temporary = array[i];

    // 交換陣列元素。
    array[i] = array[j];

    // 完成交換。
    array[j] = temporary;
  }
}

// 當瀏覽器視窗尺寸改變時執行。
function windowResized() {
  // 重新調整畫布大小。
  resizeCanvas(windowWidth, windowHeight);

  // 重新設定按鈕位置。
  if (soundButton) {
    // 將按鈕固定在左上角。
    soundButton.position(20, 20);
  }
}

// 第一次點擊畫布時啟動音效。
function mousePressed() {
  // 如果音效已開啟，就啟動音效環境。
  if (soundEnabled) {
    // 啟動音效。
    startAudio();
  }
}

// 第一次觸控畫面時啟動音效。
function touchStarted() {
  // 如果音效已開啟，就啟動音效環境。
  if (soundEnabled) {
    // 啟動音效。
    startAudio();
  }

  // 防止觸控造成頁面捲動。
  return false;
}
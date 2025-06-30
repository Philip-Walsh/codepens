$(function () {
  // Robot arm parameters (in cm for realistic scale)
  const LINK_LENGTHS = [15, 20, 15, 10, 8]; // Base height, shoulder, elbow, wrist, gripper
  const FLOOR_Y = 420; // Floor level in SVG coordinates

  // Robot state: [baseX, baseY, shoulder, elbow, wrist, roll, pitch, yaw, gripper]
  let robotState = [0, 0, 45, -30, 0, 0, 0, 0, 15];

  // Joint limits for each degree of freedom
  const limits = [
    [-50, 50],    // Base X translation (cm)
    [-50, 50],    // Base Y translation (cm)
    [-180, 180],  // Shoulder rotation
    [-180, 150],  // Elbow rotation
    [-180, 180],  // Wrist rotation
    [-180, 180],  // End effector Roll (X-axis)
    [-90, 90],    // End effector Pitch (Y-axis)
    [-180, 180],  // End effector Yaw (Z-axis)
    [-45, 90]     // Gripper/Pincer
  ];

  let activeKeys = new Set();
  let ballPosition = { x: 450, y: 375 };
  let ballGrasped = false;
  let endEffectorPos = { x: 0, y: 0, z: 0 };
  let endEffectorOrientation = { roll: 0, pitch: 0, yaw: 0 };

  // Convert degrees to radians
  const rad = (deg) => deg * Math.PI / 180;

  // Convert 3D coordinates to isometric 2D projection
  function toIsometric(x, y, z) {
    const isoX = (x - y) * 0.866; // cos(30°) ≈ 0.866
    const isoY = (x + y) * 0.5 - z; // sin(30°) = 0.5
    return { x: isoX, y: isoY };
  }

  // Forward kinematics with proper 3D orientation
  function forwardKinematics() {
    const [baseX, baseY, shoulder, elbow, wrist, roll, pitch, yaw, gripper] = robotState;

    // Convert angles to radians
    const shoulderRad = rad(shoulder);
    const elbowRad = rad(elbow);
    const wristRad = rad(wrist);
    const rollRad = rad(roll);
    const pitchRad = rad(pitch);
    const yawRad = rad(yaw);

    // Forward kinematics calculation
    let x = baseX; // Start at base X position
    let y = baseY; // Start at base Y position
    let z = LINK_LENGTHS[0]; // Start at base height

    // Shoulder joint contribution
    const shoulderX = LINK_LENGTHS[1] * Math.cos(shoulderRad);
    const shoulderZ = LINK_LENGTHS[1] * Math.sin(shoulderRad);
    z += shoulderZ;

    // Elbow joint contribution
    const elbowAngle = shoulderRad + elbowRad;
    const elbowX = LINK_LENGTHS[2] * Math.cos(elbowAngle);
    const elbowZ = LINK_LENGTHS[2] * Math.sin(elbowAngle);
    x += shoulderX + elbowX;
    z += elbowZ;

    // Wrist joint contribution
    const wristAngle = elbowAngle + wristRad;
    const wristX = LINK_LENGTHS[3] * Math.cos(wristAngle);
    const wristZ = LINK_LENGTHS[3] * Math.sin(wristAngle);
    x += wristX;
    z += wristZ;

    // End effector position
    const gripperAngle = wristAngle;
    const gripperX = LINK_LENGTHS[4] * Math.cos(gripperAngle);
    const gripperZ = LINK_LENGTHS[4] * Math.sin(gripperAngle);
    x += gripperX;
    z += gripperZ;

    // Store end effector orientation (Euler angles)
    endEffectorOrientation = { roll, pitch, yaw };

    return { x, y, z };
  }

  // Check collisions
  function checkCollisions(pos) {
    const floorCollision = pos.z <= 0;
    const baseCollision = Math.abs(pos.x) > 60 || Math.abs(pos.y) > 60;
    return { floor: floorCollision, bounds: baseCollision };
  }

  // Update robot visualization
  function updateRobot() {
    const [baseX, baseY, shoulder, elbow, wrist, roll, pitch, yaw, gripper] = robotState;

    // Calculate end effector position
    endEffectorPos = forwardKinematics();

    // Check collisions
    const collisions = checkCollisions(endEffectorPos);
    const status = $('#status');

    if (collisions.floor) {
      status.text('⚠️ Floor Collision!').css('color', '#ff3b30');
    } else if (collisions.bounds) {
      status.text('⚠️ Out of bounds!').css('color', '#ff3b30');
    } else {
      status.text('✅ Ready').css('color', '#30d158');
    }

    // Update robot base position
    const baseIso = toIsometric(baseX, baseY, 0);
    const robotBaseX = 300 + baseIso.x * 3;
    const robotBaseY = 420 + baseIso.y * 3;
    $('#robot').attr('transform', `translate(${robotBaseX},${robotBaseY})`);

    // Update joint rotations (keep base at 0 - no rotation!)
    $('#s1').attr('transform', ''); // Base never rotates
    $('#s2').attr('transform', `rotate(${shoulder})`);
    $('#s3').attr('transform', `translate(0,-60) rotate(${elbow})`);
    $('#top').attr('transform', `translate(0,-50) rotate(${wrist})`);

    // Update gripper with 3D orientation visualization
    const gripperTransform = `translate(0,-30) rotate(${yaw})`;
    $('#pincer').attr('transform', gripperTransform);

    // Update gripper jaws
    $('#pl').attr('transform', `rotate(${gripper})`);
    $('#pr').attr('transform', `rotate(${-gripper})`);

    // Update end effector position indicator
    const endIso = toIsometric(endEffectorPos.x, endEffectorPos.y, endEffectorPos.z);
    const endScreenX = 300 + endIso.x * 3;
    const endScreenY = 420 - endIso.y * 3;
    $('#endEffectorPos').attr('cx', endScreenX).attr('cy', endScreenY);

    // Update displays
    $('#a1').text(Math.round(baseX * 10) / 10);
    $('#a2').text(Math.round(baseY * 10) / 10);
    $('#a3').text(Math.round(shoulder));
    $('#a4').text(Math.round(elbow));
    $('#a5').text(Math.round(wrist));
    $('#roll').text(Math.round(roll));
    $('#pitch').text(Math.round(pitch));
    $('#yaw').text(Math.round(yaw));
    $('#gripper').text(Math.round(gripper));

    // Update 3D position display
    $('#endX').text(Math.round(endEffectorPos.x * 10) / 10);
    $('#endY').text(Math.round(endEffectorPos.y * 10) / 10);
    $('#endZ').text(Math.round(endEffectorPos.z * 10) / 10);

    // Check ball proximity
    const ballDist = Math.sqrt(
      Math.pow(endEffectorPos.x - (ballPosition.x - 300) / 3, 2) +
      Math.pow(endEffectorPos.y - (ballPosition.y - 420) / 3, 2) +
      Math.pow(endEffectorPos.z, 2)
    );

    if (ballDist < 3 && !ballGrasped && !collisions.floor) {
      status.text('🎯 Ball in reach! Press Pick Ball').css('color', '#ff9500');
    }

    // Move ball with gripper if grasped
    if (ballGrasped) {
      const ballScreenPos = toIsometric(endEffectorPos.x, endEffectorPos.y, endEffectorPos.z);
      ballPosition.x = 300 + ballScreenPos.x * 3;
      ballPosition.y = 420 - ballScreenPos.y * 3;
      $('#ball').attr('cx', ballPosition.x).attr('cy', ballPosition.y);
      $('#ballShadow').attr('cx', ballPosition.x).attr('cy', ballPosition.y + 10);
    }
  }

  function highlightKey(key, active) {
    const button = $(`.key-btn[data-key="${key}"]`);
    if (active) {
      button.addClass('active');
      activeKeys.add(key);
    } else {
      button.removeClass('active');
      activeKeys.delete(key);
    }
  }

  // Enhanced keyboard controls for 3D movement
  $(document).on('keydown', e => {
    const key = e.key.toLowerCase();

    // Control mapping for 9 degrees of freedom
    const controlMap = {
      // Base Translation (no rotation!)
      'q': [0, 1.0], 'a': [0, -1.0],   // Base X movement
      'w': [1, 1.0], 's': [1, -1.0],   // Base Y movement

      // Arm Joints
      'e': [2, 2], 'd': [2, -2],       // Shoulder
      'r': [3, 2], 'f': [3, -2],       // Elbow
      't': [4, 2], 'g': [4, -2],       // Wrist

      // End Effector 3D Orientation (Euler Angles)
      'y': [5, 2], 'h': [5, -2],       // Roll (X-axis rotation)
      'u': [6, 2], 'j': [6, -2],       // Pitch (Y-axis rotation)
      'i': [7, 2], 'k': [7, -2],       // Yaw (Z-axis rotation)

      // Gripper
      'o': [8, 2], 'l': [8, -2],       // Gripper open/close
    };

    if (controlMap[key]) {
      e.preventDefault();
      const [index, delta] = controlMap[key];
      const newValue = robotState[index] + delta;

      // Check limits
      if (newValue >= limits[index][0] && newValue <= limits[index][1]) {
        // Test for collision before applying
        const oldValue = robotState[index];
        robotState[index] = newValue;
        const testPos = forwardKinematics();
        const testCollisions = checkCollisions(testPos);

        if (testCollisions.floor && index >= 2) { // Only block arm movements for floor collision
          robotState[index] = oldValue;
          $('#status').text('⚠️ Movement blocked by floor').css('color', '#ff3b30');
          return;
        }
      }

      robotState[index] = Math.min(limits[index][1], Math.max(limits[index][0], robotState[index]));
      updateRobot();
      highlightKey(key, true);
    }
  });

  $(document).on('keyup', e => {
    const key = e.key.toLowerCase();
    highlightKey(key, false);
  });

  // Animation function
  function animateToTarget(targets, duration = 1000) {
    const start = robotState.slice();
    const steps = 60;
    const dt = duration / steps;
    let step = 0;

    clearInterval(window.animLoop);
    window.animLoop = setInterval(() => {
      step++;
      for (let i = 0; i < robotState.length; i++) {
        robotState[i] = start[i] + (targets[i] - start[i]) * (step / steps);
      }
      updateRobot();
      if (step >= steps) clearInterval(window.animLoop);
    }, dt);
  }

  // Action buttons
  $('#pick').click(() => {
    const ballDist = Math.sqrt(
      Math.pow(endEffectorPos.x - (ballPosition.x - 300) / 3, 2) +
      Math.pow(endEffectorPos.y - (ballPosition.y - 300) / 3, 2) +
      Math.pow(endEffectorPos.z, 2)
    );

    if (ballDist < 3) {
      ballGrasped = !ballGrasped;
      if (ballGrasped) {
        $('#status').text('🤖 Ball grasped!').css('color', '#30d158');
        robotState[8] = 70; // Close gripper
      } else {
        $('#status').text('🤖 Ball released').css('color', '#ff9500');
        robotState[8] = 15; // Open gripper
      }
      updateRobot();
    } else {
      $('#status').text('❌ Ball too far away').css('color', '#ff3b30');
    }
  });

  $('#wave').click(() => {
    // Wave sequence with 3D orientation
    animateToTarget([0, 0, 60, 30, 45, 0, 0, 45, 20], 800);
    setTimeout(() => animateToTarget([0, 0, 60, 60, 90, 0, 0, -45, 20], 800), 900);
    setTimeout(() => animateToTarget([0, 0, 60, 30, 45, 0, 0, 45, 20], 800), 1800);
  });

  $('#home').click(() => {
    ballGrasped = false;
    animateToTarget([0, 0, 45, -30, 0, 0, 0, 0, 15], 1200);
  });

  $('#reach').click(() => {
    // Calculate position to reach ball
    const ballX = (ballPosition.x - 300) / 3;
    const ballY = (ballPosition.y - 420) / 3;

    // Simple inverse kinematics to reach ball
    const distance = Math.sqrt(ballX * ballX + ballY * ballY);
    const totalReach = LINK_LENGTHS[1] + LINK_LENGTHS[2] + LINK_LENGTHS[3];

    if (distance <= totalReach) {
      const targetBase = [ballX, ballY, -45, -90, 45, 0, -90, 0, 15];
      animateToTarget(targetBase, 1500);
      $('#status').text('🎯 Reaching for ball...').css('color', '#007aff');
    } else {
      $('#status').text('❌ Ball out of reach').css('color', '#ff3b30');
    }
  });

  // Ball dragging (same as before)
  let dragging = false;
  let offsetX = 0, offsetY = 0;

  $('#ball').on('mousedown', function (e) {
    if (ballGrasped) return;

    dragging = true;
    const rect = $('#arm')[0].getBoundingClientRect();
    const svgX = (e.clientX - rect.left) * (600 / rect.width);
    const svgY = (e.clientY - rect.top) * (500 / rect.height);
    offsetX = svgX - ballPosition.x;
    offsetY = svgY - ballPosition.y;
    $(this).css('cursor', 'grabbing');
  });

  $(document).on('mouseup', () => {
    dragging = false;
    $('#ball').css('cursor', 'grab');
  });

  $(document).on('mousemove', function (e) {
    if (dragging && !ballGrasped) {
      const rect = $('#arm')[0].getBoundingClientRect();
      const svgX = (e.clientX - rect.left) * (600 / rect.width);
      const svgY = (e.clientY - rect.top) * (500 / rect.height);

      let x = svgX - offsetX;
      let y = svgY - offsetY;

      // Constrain to floor area
      x = Math.max(150, Math.min(450, x));
      y = Math.max(350, Math.min(420, y));

      ballPosition.x = x;
      ballPosition.y = y;

      $('#ball').attr('cx', x).attr('cy', y);
      $('#ballShadow').attr('cx', x).attr('cy', y + 10);
    }
  });

  // Initialize
  updateRobot();
  $('#ball').css('cursor', 'grab');
});
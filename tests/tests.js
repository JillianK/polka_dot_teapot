function testSuite() {
  print("Starting tests");
  testBumpMapping();
}

function testBumpMapping() {
  print("Testing normals");
  var originalN = unitize([12, 5, -3]);
  print("originalN", originalN);
  var bumpNorm = [0.6978783654588461, 0.20201742158019229, 0.6871351747673672, 1];
  print("bumpNormal", bumpNorm);
  var perturbed = perturbNormal(originalN, bumpNorm);
  print("perturbed normal", perturbed);
}
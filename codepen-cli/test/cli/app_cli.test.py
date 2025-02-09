# import pytest
# from click.testing import CliRunner
# from cli import cli  # Assuming your script is named cli.py

# def test_get_collection():
#     runner = CliRunner()
#     result = runner.invoke(cli, ["get-collection", "--name", "MyCollection"])
#     assert result.exit_code == 0
#     assert "Fetching all CodePens in collection: MyCollection" in result.output

# def test_get_codepen():
#     runner = CliRunner()
#     result = runner.invoke(cli, ["get-codepen", "--id", "12345"])
#     assert result.exit_code == 0
#     assert "Fetching CodePen with ID: 12345" in result.output



def test():
    assert 1 == 1
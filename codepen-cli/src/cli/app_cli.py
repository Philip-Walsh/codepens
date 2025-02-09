"""Contains the Options Arguments and Commands for the CLI"""
import click

@click.group()
def cli():
    "Click CLI for managing CodePens"

@cli.command(name="get-collection")
@click.option("--name", type=click.STRING)
def get_collection(name):
    "Gets all CodePens in a collection"
    click.echo(f"Fetching all CodePens in collection: {name}")

@cli.command(name="get-codepen")
@click.option("--id", type=click.STRING, help="The ID of the codepen")
def get_codepen(id):
    "Gets a CodePen by ID"
    click.echo(f"Fetching CodePen with ID: {id}")

cli.add_command(get_collection)
cli.add_command(get_codepen)
